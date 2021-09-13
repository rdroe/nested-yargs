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
        fn: Function[]
    } = commands.reduce((accum, curr) => {

        if (accum.layer[curr] && !lastCommandFound) {
            const { submodules, help, fn, yargs: yOpts = {} } = accum.layer[curr]
            yargsOptions = { ...yargsOptions, ...yOpts }

            return {
                layer: submodules ?? accum.layer,
                help,
                fn: (fn) ? [
                    ...accum.fn,
                    () => fn(yargs(input).options(yargsOptions).argv)
                ] : accum.fn
            }
        }
        lastCommandFound = true
        return accum
    }, {
        layer: modules,
        help: null,
        fn: []
    })

    if (reduced.fn.length > 0) {
        const proms =
            reduced.fn.map(async (someFn) => {
                try {
                    const r = await someFn()
                    return r
                } catch (e) {
                    console.error(e.message)
                    console.error(e.stack)
                }
            })
        const allResults = await Promise.all(proms)
        return allResults
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
