import yargs, { CommandModule } from 'yargs'
import matchCmd from './commands/match'
import stringArgv from 'string-argv'
import { add } from './queue'
import readline from 'readline'
const match: CommandModule = matchCmd


export default async (modules: CommandModule[], replStr: string | undefined = '') => {
    yargs.usage("$0 command")
    const allModules: CommandModule[] = modules
    allModules.push(match)
    const moduleProms = allModules.map(async (module: CommandModule) => yargs.command(module).argv)
    await Promise.all(moduleProms)
    yargs.demand(1, "You must provide a valid command")
        .help("h")
        .alias("h", "help").argv
    return true
}


export const repl = (modules: CommandModule[]) => {
    const rb = (input: string) => {
        return new Promise((res) => {
            add(res)
            return repl_(modules, input)
        })
    }


    const callRb = () => {
        return new Promise((replRes) => {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            rl.question('rb > ', (input) => {
                rb(input)
                    .then(x => {
                        rl.close()
                        replRes(x)
                        callRb()
                    })
            });
        })
    }

    callRb()
}


async function repl_(modules: CommandModule[], input: string = '') {
    const simArgv = input === '' ? undefined : stringArgv(input)

    yargs(simArgv).usage("$0 command")
    const allModules: CommandModule[] = modules
    allModules.push(match)
    const moduleProms = allModules.map(async (module: CommandModule) => yargs(simArgv).command(module).argv)
    await Promise.all(moduleProms)
    yargs(simArgv).demand(1, "You must provide a valid command")
        .help("h")
        .alias("h", "help").argv
    return true
}
