import yargs, { CommandModule } from 'yargs'
import matchCmd from './commands/match'
const match: CommandModule = matchCmd
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
