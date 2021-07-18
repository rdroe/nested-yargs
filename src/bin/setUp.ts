import yargs, { CommandModule } from 'yargs'
import matchCmd from './commands/match'
import stringArgv from 'string-argv'
const match: CommandModule = matchCmd

export const repl = (modules: CommandModule[], input: string = '') => {
    const simArgv = input === '' ? undefined : stringArgv(input)
    yargs(simArgv).usage("$0 command")
    const allModules: CommandModule[] = modules
    allModules.push(match)
    allModules.forEach((module: CommandModule) => {
        yargs(simArgv).command(module).argv
    })

    yargs(simArgv).demand(1, "You must provide a valid command")
        .help("h")
        .alias("h", "help").argv

}

export default (modules: CommandModule[]) => {
    yargs.usage("$0 command")
    const allModules: CommandModule[] = modules
    allModules.push(match)
    allModules.forEach((module: CommandModule) => {
        yargs.command(module).argv
    })

    yargs.demand(1, "You must provide a valid command")
        .help("h")
        .alias("h", "help").argv

}
