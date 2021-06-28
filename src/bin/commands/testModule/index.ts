
import { CommandModule, Options } from 'yargs'
import { AppOptions, AppArgv } from '../../../../index'

const anarg: Options = {
    alias: 'a',
    description: 'a sub-command option',
    demandOption: true
}

const subOpts: AppOptions = {
    anarg
}

const sub = {
    command: 'subcommand [options]',
    describe: 'test whether cli commands work',
    builder: subOpts,
    handler: (args: AppArgv) => {
        const anarg_ = args.anarg
        console.log(`${anarg_} ... in bed?`)
    }
} as CommandModule

export default {
    command: 'testcli',
    describe: 'test whether cli commands (and subs) work',
    builder: (yargs) => {
        return yargs.command(sub)
    },
    handler: () => { }
} as CommandModule
