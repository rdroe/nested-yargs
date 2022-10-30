import { Module, ParallelModule, Result, Modules, BaseArguments } from '../shared/utils/types'
import stringArgv from 'string-argv'
import loop, { Executor } from './loop'
import { showModule } from './help'
import { get } from '../shared/index'
import { RESULT_KEY } from '../shared/utils/const'
import { parse } from '../shared/utils/cliParser'


const isNumber = (arg: string): boolean => {
    return arg.match(/^(\-{0,1}[0-9]+\.[0-9]+|^\-{0,1}[0-9]+)$/) !== null
}
const DO_LOG = false

const log = (...args: any[]) => {
    if (DO_LOG) {
        console.log(...args)
    }
}

type WrapperFn = (priors: any, isTop?: boolean) => Promise<{ [RESULT_KEY]: any, argv?: any }>

interface Accumulator {
    layer: { [moduleName: string]: Module | ParallelModule },
    help: any,
    fn: {
        [currNs: string]: WrapperFn
    },
    currentNamespace: string
}

type LookerUpperCaller = (modules: { [moduleName: string]: Module | ParallelModule }, input: string[], commands: (number | string)[]) => Promise<Result>

// singleton (may not be needed, but a cached spot so the same one is always returned.
let lookUpAndCall_: LookerUpperCaller

const yargsStarter = {
    'commands': {
        array: true,
        alias: 'c:c',
        //            default: ['*'] as string[]
    },
    'names': {
        array: true,
        alias: 'c:n',
        //          default: ['*'] as string[]
    }
}

const makeLookUpAndCall = async (yargs: any): Promise<LookerUpperCaller> => {
    // if the singleton is already set, return it; otherwise set and return the singleton appropriately
    lookUpAndCall_ = lookUpAndCall_ || lookUpCallFn
    return lookUpAndCall_

    async function lookUpCallFn(modules: { [moduleName: string]: Module }, input: string[], commands: (number | string)[]): Promise<Result> {

        let yargsOptions = {
            ...yargsStarter
        }

        let lastCommandFound = false

        const lastPositionalOrNeg = input.findIndex(arg => {
            return arg.charAt(0) === '-'
                && !isNumber(arg)
        })

        const lastPositional = lastPositionalOrNeg > -1 ? lastPositionalOrNeg : input.length

        let helpModule: Module | ParallelModule
        let helpPrefix: string
        let parentmostIsAsync: boolean
        const namespaces: string[] = []
        const positionals: (string | number)[] = []
        let helpShown: boolean = false
        // The main function is a reducer that replaces accumulated state with the pinnacle function call; e.g. 'match scalar' (see commands/) would traverse parent "match" module, then its submodule properties.
        // As the command hierarchies are traversed, the parent functions are called as well. Currently, a parent command is called before all its children but this will change in a future version.
        // Calls are async. Respective promises are tracked by key-value pair per module name.
        let showHelp: any = () => showModule({ fn: async () => { }, submodules: modules })


        const reduced: Accumulator = commands.reduce((accum: Accumulator, curr, idx) => {

            // if it's a command, found in modules...
            if (accum.layer[curr] && !lastCommandFound) {
                // take apart the module into its parts.

                const {
                    submodules,
                    help,
                    fn,
                    yargs: yOpts = {},
                    parallel
                } = accum.layer[curr]
                showHelp = () => showModule({ fn: fn as Module['fn'], submodules }, `${accum.currentNamespace}`)

                if (parentmostIsAsync === undefined) {
                    parentmostIsAsync = !!parallel
                    // on the first time through, verify that submodules are present if async
                    if (parentmostIsAsync) {
                        if (submodules === undefined || Object.values(submodules).length === 0) {
                            throw new Error(`Module properties error: A parallelizing module such as  ${curr} is required to have submodules (which it will pass to the parent ${curr}, which will control child-calling order from userland).`)
                        }
                    }
                }

                // Accumulate yargs options. This way, subcommands get parent opts, but children can override. (Positional arguments may be complicated; but possibly not.) 
                yargsOptions = { ...yargsOptions, ...yOpts }

                // create the key at which results will eventually be stored, should a function be called and return data.

                const newNs = `${accum.currentNamespace} ${curr}`.trim()
                namespaces.push(newNs)
                // HERE, WE'RE CREATING A READY-TO-CALL WRAPPER...
                // and stacking it carefully to be called in the proper order later.
                // It takes a "priors" argument for prior generations 
                const wrapperFn: WrapperFn = async (priors: any, isTop = false) => {
                    console.log('options input A', yargsOptions)
                    console.log('parse input A', input)
                    // for each call, we need to put yargs into the appropriate state.
                    const opts1 =
                        parse(submodules, yargsOptions, input)
                    console.log('A out', opts1)



                    console.log('homegrown:', opts1)
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

                        if (parentmostIsAsync === false) {
                            await Promise.all(Object.values(priors))
                            result = await fn(argv1, priors)
                            log('result from fn()', result)
                        }

                        if (parentmostIsAsync === true) {
                            // return directly if this argument is passed; presume we will manually package the parentmost result.
                            if (isTop) {
                                result = await fn(argv1, priors) // can i remove await? it's preferable if i can, for some reason
                                log('result from async parent fn()', result)
                            } else {
                                const res = await fn(argv1, priors)
                                log('result from async child fn()', result)
                                return { [RESULT_KEY]: res }
                            }
                        }
                    }

                    return {
                        [RESULT_KEY]: result
                    }

                } // end WrapperFn



                return {
                    layer: submodules ?? accum.layer,
                    help,
                    fn: (fn) ? {
                        ...accum.fn,
                        [newNs]: wrapperFn,
                    } : accum.fn,
                    currentNamespace: newNs
                }
            } // end if accum.layer[curr]


            // we arrive here if a non-command--but also a non-option--is found.
            // in yargs, a "positional argument".

            // the word is not on the modules defined



            positionals.push(curr)
            lastCommandFound = true


            return accum
        }, {
            layer: modules, // layer is modules at beginning
            help: null,
            fn: {},
            currentNamespace: ''
        } as Accumulator) // End reduce call
        console.log('options input B', yargsOptions)
        console.log('parse input B', input)


        const opts1: any = parse(modules, yargsOptions, input)
        const entries = Object.entries(reduced.fn)

        if (opts1.help === true) {
            showHelp()
        }


        if (entries.length === 0) {
            const ret: Result = {
                isMultiResult: false,
                [RESULT_KEY]: {},
                errorInfo: null
            }
            if (namespaces.length === 0) {
                ret.errorInfo = 'No commands found to match input'
            }
            return ret
        }

        return parentmostIsAsync ? await orderCallsAsync(entries, opts1) : await orderCallsSync(entries)

    } // end lookupCallFn
} // end makeLookUpAndCall

async function orderCallsSync(entries: [string, WrapperFn][]): Promise<Result> {
    entries.reverse()
    // With the functions sort of queued up and wrapped with the correct command name and the correct argument set, now map through them and call each.


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
                            // if a result, stow it.


                            if (r !== undefined) {
                                mappedResults[key] = r[RESULT_KEY]
                                mappedArgv[key] = r.argv
                            }

                        })

                    })
                } catch (cause) {
                    // @ts-ignore
                    throw new Error(`After ordering the call hierarchy and trying to trigger ${key}`, { cause })
                }
            })
    // notice that as of this iteration, the parent could get called before children, or in any order.

    await Promise.all(proms)
    await rollingProm

    // structure this with isMultiResult and list so that, later in nyargs loop.ts and in the cache hook, data gets appraised by caching module and properly stowed later on. 
    return { isMultiResult: true, list: mappedResults, errorInfo: null }
}


async function orderCallsAsync(entries: [string, WrapperFn][], opts1: any): Promise<Result> {

    // With the functions sort of queued up and wrapped with the correct command name and the correct argument set, now map through them and call each.

    const topEntry = entries.shift()
    const result = await topEntry[1](entries, true)

    return {
        isMultiResult: false,
        [RESULT_KEY]: result,
        errorInfo: null
    }

}

let resolveCaller: Function

export const caller: { get: Promise<(m: Modules, input: string) => { argv: BaseArguments, [RESULT_KEY]: object }> } = {
    get: new Promise((res) => {
        resolveCaller = res
    })
}

export const makeCaller = (yargs: any): Executor => {

    const caller = async (modules: { [moduleName: string]: Module }, input: string) => {

        const lookUpAndCall = await makeLookUpAndCall(yargs)
        const simArgv = stringArgv(input)
        console.log('options input C (make caller)', undefined, '(parses only)')
        console.log('parse input C (make caller)', simArgv)
        console.log('parse arg is ', input, 'after simArgv')

        const argv = parse(modules, yargsStarter, simArgv)
        console.log('c out', argv)
        const commands = argv._
        const result = await lookUpAndCall(modules, simArgv, commands)

        return { argv, [RESULT_KEY]: result }
    }
    resolveCaller(caller)
    return caller
}

export const repl = async (modules: { [moduleName: string]: Module | ParallelModule }, yargs: any, prompt?: string): Promise<any> => {

    const setAll = await get('setAll')
    await setAll()

    try {

        const caller = makeCaller(yargs)
        return await loop(
            modules as Modules /* importantly, more complex than actual "Modules" we are as-ing to*/,
            caller,
            prompt)


    } catch (e) {
        // @ts-ignore
        const fullError = new Error('In loop.ts while running getExecuteCli:', { cause: e })
        console.error(fullError.message)
        console.error(fullError.stack)
        console.error((fullError as any).cause)
        lookUpAndCall_ = undefined
        return await repl(modules, yargs, prompt)
    }
}



