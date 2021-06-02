
import yargs, { Options } from 'yargs'

import * as brackets from './commands/brackets'
import * as match from './commands/match'

const modules = [
    brackets,
    match
]

modules.forEach(({
    command,
    demandOption,
    options
}: { command: [string, string], demandOption: string[], options: { [prop: string]: Options } }) => {

    yargs
        .command(command[0], command[1], function(yrgs) {
            yrgs.usage(`$0 ${command[0]} [options]`)
                .options(options)
                .demandOption(demandOption)
        })
})

yargs.demandCommand(1)

const [command] = yargs.argv._

const module = modules.find(({ command: cmd }: { command: [string, string] }) => {

    return cmd[0] && cmd[0] === command
})

const { action } = module

// @todo : make an object signature for action function.
// @todo : wherever an object with more than one property exists, make a type, e.g. command, demandOption, etc
action(module, yargs.argv)
