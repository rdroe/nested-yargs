
import { CommandModule, Options, Argv } from 'yargs'
import { Action, AppOptions, AppArgv } from '../../../../index'

export const stem = (nm: string, subs: CommandModule[], desc: string = nm) => {
    return {
        command: `${nm} <subcommand>`,
        describe: desc,
        builder: (yargs) => {
            subs.forEach((module: CommandModule) => {
                yargs.command(module).argv
            })
            return yargs.demandCommand()
        }
    } as CommandModule
}

export const leaf = (nm: string, opts: AppOptions, action: Action, desc: string = nm): CommandModule => {
    return {
        command: `${nm} [options]`,
        describe: desc,
        builder: opts,
        handler: (args) => {

            const { a: a_, anarg: a2_ } = args
            const str = a_ ?? a2_

            if (typeof (str) !== 'string' && typeof (str) !== 'number') throw new Error(`string is required for option anarg`)

            action({ anarg: str })
        }
    }
}

const anarg: Options = {
    alias: 'a',
    description: 'a sub-command option',
    demandOption: true
}

const subOpts: AppOptions = {
    anarg
}

const subAct: Action = (args: AppArgv) => {
    const anarg_ = args.anarg
    console.log(`${anarg_} ... in bed?`)
}

const sub = leaf('subcommand', subOpts, subAct, 'test working cli commands or not')

export default stem('testcli', [sub], 'test: do cmds, subcmds work?')
