import yargs from 'yargs'
import { Module, Modules, Result } from './appTypes'
import stringArgv from 'string-argv'
import loop, { Executor } from './loop'
import { showModule } from './help'

export default () => { }

type WrapperFn = (priors: any) => Promise<{ result: any, argv: any }>

interface Accumulator {
    layer: any,
    help: any,
    fn: {
        [currNs: string]: WrapperFn
    },
    currentNamespace: string
}

const lookUpAndCall = async (modules: Modules, input: string[], commands: (number | string)[]): Promise<Result> => {
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
    let helpModule: Module
    let helpPrefix: string
    // The main function is a reducer that replaces accumulated state with the pinnacle function call; e.g. 'match scalar' (see commands/) would traverse parent "match" module, then its submodule properties.
    // As the command hierarchies are traversed, the parent functions are called as well. Currently, a parent command is called before all its children but this will change in a future version.
    // Calls are async. Respective promises are tracked by key-value pair per module name.
    const reduced: Accumulator = commands.reduce((accum: Accumulator, curr) => {

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
            const wrapperFn: WrapperFn = async (priors: any) => {
                // for each call, we need to put yargs into the appropriate state.
                const opts1 =
                    await yargs.help(false)
                        .options(yargsOptions)
                        .parse(input)

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
                    result = null
                    helpModule = helpModule ?? accum.layer[curr]
                    helpPrefix = helpPrefix ?? newNs
                } else {
                    await Promise.all(Object.values(priors))
                    result = await fn(argv1, priors)
                }
                return {
                    result,
                    argv: argv1
                }
            }

            return {
                layer: submodules ?? accum.layer,
                help,
                fn: (fn) ? {
                    ...accum.fn,
                    [newNs]: wrapperFn,
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
    } as Accumulator)

    const opts1: any =
        yargs.help(false)
            .options(yargsOptions)
            .parse(input)

    const entries = Object.entries(reduced.fn)
    entries.reverse()

    if (entries.length === 0) {
        if (opts1.help === true) {
            const topHelp: Module = {
                fn: () => { },
                submodules: modules
            }
            showModule(topHelp)
        }
    }

    // With the functions sort of queued up and wrapped with the correct command name and the correct argument set, now map through them and call each.
    if (entries.length > 0) {

        const mappedResults: {
            [namespace: string]: any
        } = {}

        const mappedArgv: {
            [namespace: string]: any
        } = {}
        let rollingProm: Promise<void> = Promise.resolve()
        const proms =
            entries
                .map(async ([key, wrapperFn]) => {
                    try {

                        rollingProm = rollingProm.then(() => {

                            return wrapperFn(mappedResults).then((r) => {
                                // if a result stow it.
                                if (r !== undefined) {
                                    mappedResults[key] = r.result
                                    mappedArgv[key] = r.argv
                                }

                            })

                        })
                    } catch (e) {
                        console.error(e.message)
                        console.error(e.stack)
                    }
                })
        // notice that as of this iteration, the parent could get called before children, or in any order.

        await Promise.all(proms)
        await rollingProm
        if (opts1.help === true) {
            showModule(helpModule, helpPrefix || '')
            return {
                isMultiResult: false,
                argv: opts1,
                result: {}
            }
        }

        const resultCnt = Object.values(mappedResults).length

        if (resultCnt === 0) {
            return {
                isMultiResult: false,
                argv: opts1,
                result: {}
            }
        }
        // structure this with isMultiResult and list so that, later in nyargs loop.ts and in the cache hook, data gets appraised by caching module and properly stowed later on. 
        return { isMultiResult: true, list: mappedResults, argv: mappedArgv }
    }

    return {
        isMultiResult: false,
        argv: opts1,
        result: {}
    }
}

export const caller: Executor = async (modules: Modules, input: string) => {
    const simArgv = stringArgv(input)
    const argv = await (yargs.help(false).parse(simArgv))
    const commands = argv._
    const result = await lookUpAndCall(modules, simArgv, commands)
    return { argv, result }
}

export const repl = async (modules: Modules) => {
    return await loop(modules, caller)
}
