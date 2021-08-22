import yargs, { CommandModule, Arguments, Argv } from 'yargs'
import { AppArguments } from './appTypes'
import matchCmd from './commands/match'
import stringArgv from 'string-argv'
import loop from './loop'

const match: CommandModule = matchCmd

// one-shot (default) nested runner.
export default async (modules: CommandModule[]) => {
    yargs.usage("$0 command")
    const allModules: CommandModule[] = modules
    allModules.push(match)
    const moduleProms = allModules.map(async (module: CommandModule) => {
        return yargs.command(module)
    })

    await Promise.all(moduleProms)

    yargs.demand(1, "You must provide a valid command")
        .help("h")
        .alias("h", "help")
        .argv

    return true
}

export const repl = async (modules: CommandModule[]) => {
    return await loop(modules, repl_)
}


const harvestResults = async (awaited: Arguments<{ result: object }>): Promise<object> => {
    // For now, the imported  modules must always assign "result" on the argv object, which we process here.
    // This is a bit of a hack ; not sure how to return the result properly by means of yargs calls to Command module submodules
    const json =
        awaited.result

    delete awaited.result
    return json
}

async function repl_(modules: CommandModule[], input: string = '') {

    const simArgv = stringArgv(input)
    const universalOpts = {
        'c:n':
        {
            alias: 'cache: names index',
            global: true,
            array: true,
            describe: 'filter for estting cache address by names'
        },
        'c:c':
        {
            alias: 'cache: commands index',
            global: true,
            array: true,
            describe: 'filter for setting cache address by commands'
        }
    }
    yargs
        .options(universalOpts)
        .exitProcess(false)
        .usage("$0 command")

    const allModules: CommandModule[] = modules
    allModules.push(match)
    const moduleProms = allModules.map(async (module: CommandModule) => yargs.command(module))

    await Promise.all(moduleProms)

    yargs
        .exitProcess(false)
        .demand(1,
            "You must provide a valid command")
        .help("h")
        .alias("h", "help")


    // Use the afterParse function to effect the yargs call; which requires a bit of specialized massaging to work asynchronously
    try {
        const parseRes: Arguments = await yargs.parseAsync(simArgv, {}, afterParse)

        if (typeof parseRes.result !== 'object') throw new Error('no result is attached.')

        const json = await harvestResults(parseRes as Arguments<{ result: object }>)

        return { result: json, argv: parseRes }
    } catch (e) {
        console.error('Error!!' + e.message)
        return ({ result: { message: e.message }, argv: {} })
    }
}

/* 
   Helper function that finished up yargs parsing 
*/
async function afterParse(err: Error, arg2: Arguments<AppArguments>): Promise<Arguments<AppArguments>> {

    if (err) {
        console.error('Error during yargs-based parsing: ', err.message)
        return ({ ...arg2, result: { message: err.message } })
    }

    return arg2
}
