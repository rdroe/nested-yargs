import { cache } from './hooks'
import { parseCacheInstructions } from './lib/store'
import { getInput } from './lib/input'
import { AppArguments, Modules, Result } from './appTypes'

type Program = Array<string>
type Dictionary = { [programName: string]: Program }
type ProgramRef = { array: string[], dictionary: Dictionary }

const program: ProgramRef = {
    array: [],
    dictionary: {}
}

export const setDictionary = (
    dict: Dictionary
) => {
    program.dictionary = dict
}

export const getDictionary = () => program.dictionary

const logResult = (result: Result) => {
    if (result.argv.help === true) {
        return
    }
    if (!result.isMultiResult) {
        console.log(result)
    } else {
        Object.entries(result.list).forEach(([idx, res]) => {
            console.log(`${idx} result:`)
            console.log(res)
            if (result.argv[idx].logArgs === true) {
                console.log(`${idx} computed arguments:`)
                console.log(result.argv[idx])
                console.log('all args:')
                console.log(result)
            }
        })
    }
}

export const queue = (stringOrProg: string | Program) => {

    let lookedUpProg: Array<string>

    if (typeof stringOrProg === 'string') {
        if (typeof program.dictionary[stringOrProg] !== 'object') {
            throw new Error(`no program or invalid program at "${stringOrProg}"`)
        }
        lookedUpProg = program.dictionary[stringOrProg]
    } else {
        lookedUpProg = stringOrProg
    }

    program.array = lookedUpProg

}

const PROMPT = 'nyargs > '
const JQ_DEFAULT = 'max_by(.createdAt).value'
const containsInterrupt = (rawInput: string) => {
    if (rawInput.includes('davo:dismiss') || rawInput.includes('davo:dis')) {
        return true
    }
    return false
}

/** Given input verified by verifyAndExecuteCli, force the running of the typed command. */
const getExecuteCli = async (modules: Modules, yargsCaller: Function) => async (input: string): Promise<{ argv: any, result: any }> => {
    let result: any
    let argv: any
    try {
        // call yargs (fn defined above)
        const x = await yargsCaller(modules, input || '')
        if (!x) {
            console.log('no input.')
            return
        }

        result = x.result
        argv = x.argv

    } catch (e) {
        console.log('ERROR ! ! ', e.message)
        console.log(e.stack)
    }
    return { result, argv }
}

// This is the primary loop logic. it  makes use of the above direct executor function, but also runs the loop in which the executor and the verification is run repeatedly.
async function verifyAndExecuteCli(
    forwardedInput: string | null,
    pr: string,
    executor: (arg0: string) => Promise<{ result: Result, argv: AppArguments }>): Promise<{ argv: object, result: object }> {
    let rawInput: string
    let didUseProgram: boolean = false
    // Obtain input and execute. 
    // If this is a recursion, with input already present, feed that forward.

    // If a program is being run, take the next line (if there is one)
    // as the user command.
    if (program.array.length) {
        rawInput = program.array.shift()
        console.log('program line:', rawInput)
        didUseProgram = true // track that a program was used; may need to treat it specially on expansion.
    }

    if (typeof rawInput === 'undefined') {
        rawInput = forwardedInput
            ? await getInput(pr, forwardedInput)
            : await getInput(pr)
    }

    if (containsInterrupt(rawInput)) {
        return { result: {}, argv: {} }
    }

    // Run the raw input through jq calls and cache-replacing
    const input = await parseCacheInstructions(rawInput, JQ_DEFAULT)

    // If it is different (if cache-replacing was used) verify to run.
    if (!didUseProgram && input !== rawInput) {
        return verifyAndExecuteCli(input, 'RUN AGUMENTED ? > ', executor) // loop, also giving chance to enter new input 
    } else {
        if (didUseProgram && input !== rawInput) {
            console.log('program line expanded: ', input)
        }

        // if raw matches new, just replace.
        const ret = await executor(input)
        try {
            logResult(ret.result)
            // look at the arguments and results, cache if appropriate.
            await cache(ret.argv, ret.result)
        } catch (e) {
            console.error('(could not log result)')
        }

        // start fresh
        return verifyAndExecuteCli(null, PROMPT, executor)
    }
}

export type Executor = (modules: Modules, input: string) => Promise<{ argv: object, result: Result }>

// Given a list of modules and a yargs executer-helper, provide a repl-like environment for working on command lines and running them.
const repl = async (
    modules: Modules,
    yargsCaller: Executor
) => {

    // Set up the direct evaluator of the cli, which runs after conversation with the user such as "are you sure you want to use this command line string" and background caching behavior. 
    const executeCli = await getExecuteCli(modules, yargsCaller)

    // kick off the actual loop that talks to user and repeats execution
    await verifyAndExecuteCli(null, PROMPT, executeCli)
}

export default repl
