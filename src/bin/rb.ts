
import yargs, { Argv, CommandModule } from 'yargs'
import brackets from './commands/brackets/index'
import match from './commands/match'

const modules = [
    brackets,
    match
]

yargs.usage("$0 command")

modules.forEach((module: CommandModule) => {
    yargs.command(module).argv
})

yargs.demand(1, "You must provide a valid command")
    .help("h")
    .alias("h", "help").argv


