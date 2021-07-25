import yargs, { CommandModule } from 'yargs'
import matchCmd from './commands/match'
import stringArgv from 'string-argv'
const match: CommandModule = matchCmd

export const repl = async (modules: CommandModule[], input: string = '') => {
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

export default async (modules: CommandModule[], replStr: string | undefined = '') => {
    if (replStr) { return repl(modules, replStr) }

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
