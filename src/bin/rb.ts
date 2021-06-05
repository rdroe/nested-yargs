
import yargs, { Argv } from 'yargs'
import * as brackets from './commands/brackets'
import * as match from './commands/match'
import { RbArgv, Module } from './appTypes'

const modules = [
    brackets,
    match
]

modules.forEach(({
    command,
    demandOption,
    options
}: Module) => {

    yargs
        .command(command[0], command[1], function(yrgs) {
            yrgs.usage(`$0 ${command[0]} [options]`)
                .options(options)
                .demandOption(demandOption)
        })
})

yargs.demandCommand(1)

const [userCommand]: (string | number)[] = yargs.argv._

const module = modules.find(({ command: cmd }: Module) => {

    return cmd[0] && cmd[0] === userCommand
})

const { action } = module
const { argv: rbArgv }: Argv<RbArgv> = yargs

action(rbArgv)
