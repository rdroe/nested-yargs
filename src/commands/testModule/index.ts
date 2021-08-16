import { CommandModule, Options } from 'yargs'
import { AppOptions, AppArguments } from '../../../index'

const anarg: Options = {
    alias: 'a',
    description: 'a sub-command option',
    demandOption: true
}

const subOpts: AppOptions = {
    anarg
}

const sub: CommandModule = {
    command: 'subcommand [options]',
    describe: 'test whether cli commands work',
    builder: subOpts,
    handler: (args: AppArguments) => {
        const anarg_ = args.anarg
        console.log(`${anarg_} ... in bed?`)
    }
}

const cm: CommandModule = {
    command: 'testcli',
    describe: 'test whether cli commands (and subs) work',
    builder: (yargs) => {
        return yargs.command(sub)
    },
    handler: () => { }
}

export default cm
