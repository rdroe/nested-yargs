
import yargs, { Argv, CommandModule } from 'yargs'
import brackets from './commands/brackets/index'
import * as match from './commands/match'
import { RbArgv, Module } from './appTypes'


const modules = [
    brackets
]

yargs.usage("$0 command")
modules.forEach((module: CommandModule) => {
    yargs.command(module)
})

yargs.demand(1, "You must provide a valid command")
    .help("h")
    .alias("h", "help").argv


