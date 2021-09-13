import yargs from 'yargs'
import { Modules } from './appTypes'
import stringArgv from 'string-argv'
import loop, { Executor } from './loop'

export default () => { }

const lookUpAndCall = async (modules: Modules, input: string[], commands: (number | string)[]): Promise<any> => {

    let yargsOptions = {}
    let lastCommandFound = false
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
            const newNs = `${accum.currentNamespace} ${curr}`.trim()
            return {
                layer: submodules ?? accum.layer,
                help,
                fn: (fn) ? {
                    ...accum.fn,
                    [newNs]: () => fn(yargs(input).options(yargsOptions).argv)
                } : accum.fn,
                currentNamespace: newNs
            }
        }
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
        if (Object.values(mappedResults).length === 1) {
            return Object.values(mappedResults)[0]
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
