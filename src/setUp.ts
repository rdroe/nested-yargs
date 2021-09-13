import yargs from 'yargs'
import { Modules } from './appTypes'
import stringArgv from 'string-argv'
import loop, { Executor } from './loop'

export default () => { }

const lookUpAndCall = async (modules: Modules, input: string[], commands: (number | string)[]): Promise<any> => {

    let yargsOptions = {}
    let lastCommandFound = false
    // The main function is a reducer that ongoingly replaces accumulated state with the pinnacle function call; e.g. 'match scalar' must be arrived at by stacked module-to-submodule transition.
    // At each stage, the parent functions are called as well. The respective promises are tracked by key-value pair per module name.
    const reduced: {
        layer: any,
        help: any,
        fn: { [currNs: string]: Function },
        currentNamespace: string
    } = commands.reduce((accum, curr) => {

        if (accum.layer[curr] && !lastCommandFound) {
            const {
                submodules,
                help,
                fn,
                yargs: yOpts = {}
            } = accum.layer[curr]

            yargsOptions = { ...yargsOptions, ...yOpts }
            // create the key at which results will eventually be stored, should a function be called and return data. 
            const newNs = `${accum.currentNamespace} ${curr}`.trim()
            return {
                layer: submodules ?? accum.layer,
                help,
                fn: (fn) ? {
                    ...accum.fn,
                    [newNs]: async () => {
                        // for each call, we need to put yargs into the appropriate state.
                        // part of that is extracting the positional arguments at this stage, since we are discarding yargs' management of the subcommand / positional arg distinction. (This is for use with lists of non-dash arguments)
                        const opts1 =
                            await yargs(input)
                                .options(yargsOptions)
                                .argv

                        const cmdDepth = newNs.split(' ').length
                        const positional = opts1._.slice(cmdDepth)
                        const underscore = opts1._.slice(0, cmdDepth)
                        return fn({
                            ...opts1,
                            positional,
                            // set underscore to be the converse.
                            // otherwise, all non-dash elements are in _
                            _: underscore
                        })
                    }
                } : accum.fn,
                currentNamespace: newNs
            }
        }
        // we arrive here if a non-command--but also a non-option--is found.
        // in yargs, a "positional argument".
        lastCommandFound = true
        return accum
    }, {
        layer: modules,
        help: null,
        fn: {},
        currentNamespace: ''
    })

    if (Object.entries(reduced.fn).length > 0) {
        const mappedResults: {
            [namespace: string]: any
        } = {}
        const proms =
            Object.entries(reduced.fn)
                .map(async ([key, someFn]) => {
                    try {
                        const r = await someFn()
                        if (r !== undefined) {
                            mappedResults[key] = r
                        }
                    } catch (e) {
                        console.error(e.message)
                        console.error(e.stack)
                    }
                })
        await Promise.all(proms)
        const resultCnt = Object.values(mappedResults).length
        if (resultCnt === 1) {
            return Object.values(mappedResults)[0]
        }
        if (resultCnt === 0) {
            return {}
        }
        return { isMultiResult: true, list: mappedResults }
    }

    return {}
}

export const caller: Executor = async (modules: Modules, input: string) => {
    const simArgv = stringArgv(input)
    const argv = await (yargs(simArgv).argv)
    const commands = argv._
    const result = await lookUpAndCall(modules, simArgv, commands)
    return { argv, result }
}

export const repl = async (modules: Modules) => {
    return await loop(modules, caller)
}
