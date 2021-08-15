import yargs, { CommandModule } from 'yargs'
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

export const repl = (modules: CommandModule[]) => {
    return loop(modules, repl_)
}


async function repl_(modules: CommandModule[], input: string = '') {

    const simArgv = stringArgv(input)
    const universalOpts = {
        'c':
        {
            alias: 'cache',
            global: true,
            default: '.',
            describe: 'filter for limiting the cached portion of results'
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
        const argv = await yargs.parse(simArgv, {}, afterParse)
        return { result: { line: 123 }, argv }
    } catch (e) {
        console.error('Error!!' + e.message)
        return ({ result: { message: e.message }, argv: {} })
    }
}

/* 
   Helper function that finished up yargs parsing 
*/
async function afterParse(err: Error, arg2: any): Promise<{ result: any, argv: any }> {

    if (err) {
        console.error('Error during yargs-based parsing: ', err.message)
        return ({ result: err.message, argv: arg2 })
    }

    const awaited = await arg2

    if (typeof awaited !== 'object') throw new Error('In user modules, a result must be assigned to the argv object as property "argv.result". This seems to be missing ')

    const json = JSON.parse(
        awaited.result
    )

    // For now, the imported  modules must always assign "result" on the argv object, which we process here.
    // This is a bit of a hack ; not sure how to return the result properly by means of yargs calls to Command module submodules
    delete awaited.result
    return ({ result: json, argv: awaited })
}
