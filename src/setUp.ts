import yargs from 'yargs'
import { Modules } from './appTypes'
import stringArgv from 'string-argv'
import loop, { Executor } from './loop'

export default () => { }

const lookUpAndCall = async (modules: Modules, input: string[], commands: (number | string)[]): Promise<any> => {
    // Universal options
    let yargsOptions = {
        'commands': {
            array: true,
            alias: 'c:c',
        },
        'names': {
            array: true,
            alias: 'c:n',
        }
    }
    let lastCommandFound = false
    const lastPositionalOrNeg = input.findIndex(arg => arg.charAt(0) === '-')
    const lastPositional = lastPositionalOrNeg > -1 ? lastPositionalOrNeg : input.length
    // The main function is a reducer that replaces accumulated state with the pinnacle function call; e.g. 'match scalar' (see commands/) would traverse parent "match" module, then its submodule properties.
    // As the command hierarchies are traversed, the parent functions are called as well. Currently, a parent command is called before all its children but this will change in a future version.
    // Calls are async. Respective promises are tracked by key-value pair per module name.

    const helper = (module1: any) => {
        console.log(module1)
    }
    const reduced: {
        layer: any,
        help: any,
        fn: {
            [currNs: string]: () => Promise<{ result: any, argv: any }>
        },
        currentNamespace: string
    } = commands.reduce((accum, curr) => {

        if (accum.layer[curr] && !lastCommandFound) {
            const {
                submodules,
                help,
                fn,
                yargs: yOpts = {}
            } = accum.layer[curr]
            // Accumulate yargs options. This way, subcommands get parent opts, but children can override. (Positional arguments may be complicated; but possibly not.) 
            yargsOptions = { ...yargsOptions, ...yOpts }
            // create the key at which results will eventually be stored, should a function be called and return data.

            const newNs = `${accum.currentNamespace} ${curr}`.trim()
            return {
                layer: submodules ?? accum.layer,
                help,
                fn: (fn) ? {
                    ...accum.fn,
                    [newNs]: async (): Promise<{ result: any, argv: any }> => {

                        // for each call, we need to put yargs into the appropriate state.
                        console.log('first')
                        const opts1 =
                            await yargs.help(false)
                                .options(yargsOptions)
                                .parse(input)

                        console.log('second')

                        // That requires extracting, tracking, the positional (non-dash) arguments at this stage.
                        const cmdDepth = newNs.split(' ').length
                        const positional = opts1._.slice(cmdDepth, lastPositional)
                        const underscore = opts1._.slice(0, cmdDepth)
                        const preferHelp = opts1.help === true

                        const argv1 = {
                            ...opts1,
                            positional,
                            // set underscore to be the converse.
                            // otherwise, all non-dash elements are in _
                            _: underscore
                        }
                        let result: Promise<any>
                        if (preferHelp) {
                            result = Promise.resolve(helper({
                                module: submodules ?? accum.layer,
                                argv: argv1
                            }))
                        } else {
                            result = await fn(argv1)
                        }
                        return {
                            result,
                            argv: argv1
                        }
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

    // With the functions sort of queued up and wrapped with the correct command name and the correct argument set, now map through them and call each.
    if (Object.entries(reduced.fn).length > 0) {

        const mappedResults: {
            [namespace: string]: any
        } = {}

        const mappedArgv: {
            [namespace: string]: any
        } = {}

        const proms =
            Object.entries(reduced.fn)
                .map(async ([key, someFn]) => {
                    try {
                        // call the enclosed fn + arguments packet
                        const r = await someFn()
                        // if a result stow it.
                        if (r !== undefined) {
                            mappedResults[key] = r.result
                            mappedArgv[key] = r.argv
                        }
                    } catch (e) {
                        console.error(e.message)
                        console.error(e.stack)
                    }
                })
        // notice that as of this iteration, the parent could get called before children, or in any order.
        await Promise.all(proms)
        const resultCnt = Object.values(mappedResults).length

        if (resultCnt === 0) {
            return {}
        }
        // structure this with isMultiResult and list so that, later in nyargs loop.ts and in the cache hook, data gets appraised by caching module and properly stowed later on. 
        return { isMultiResult: true, list: mappedResults, argv: mappedArgv }
    }

    return {}
}

export const caller: Executor = async (modules: Modules, input: string) => {
    const simArgv = stringArgv(input)
    console.log('16')
    const argv = await (yargs.help(false).parse(simArgv))
    console.log('16b')
    const commands = argv._
    const result = await lookUpAndCall(modules, simArgv, commands)
    return { argv, result }
}

export const repl = async (modules: Modules) => {
    return await loop(modules, caller)
}
