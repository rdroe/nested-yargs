
import yargs, { Argv } from 'yargs'
import * as brackets from './commands/brackets'
import * as match from './commands/match'
import { DemandOption, Command, RbOptions, RbArgv } from './commands/rbTypes'

const modules = [
    brackets,
    match
]

modules.forEach(({
    command,
    demandOption,
    options
}: {
    command: Command,
    demandOption: DemandOption,
    options: RbOptions
}) => {

    yargs
        .command(command[0], command[1], function(yrgs) {
            yrgs.usage(`$0 ${command[0]} [options]`)
                .options(options)
                .demandOption(demandOption)
        })
})

yargs.demandCommand(1)

const [userCommand]: (string | number)[] = yargs.argv._

const module = modules.find(({ command: cmd }: { command: Command }) => {

    return cmd[0] && cmd[0] === userCommand
})




const { action } = module
const { argv: rbArgv }: Argv<RbArgv> = yargs
// @todo : make an object signature for action function.
// @todo : wherever an object with more than one property exists, make a type, e.g. command, demandOption, etc
action(module, rbArgv)
