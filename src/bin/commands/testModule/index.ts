
import { CommandModule, Options } from 'yargs'
import { Action, AppOptions, AppArgv } from '../../../../index'

export const stem = (nm: string, subs: CommandModule[], desc: string = nm) => {
    const subOrSubs = subs[0] && typeof subs[0].builder === 'object' ? 'sub' : 'sub..'
    return {
        command: `${nm} [${subOrSubs}] [options]`,
        describe: desc,
        builder: (yargs) => {
            subs.forEach((module: CommandModule) => {
                yargs.command(module)
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

const level2 = leaf('level2', subOpts, subAct, 'test working opts')


const level1 = stem('level1', [level2], 'test level 2: do  subcmds work?')

export default stem('testcli', [level1], 'test: do cmds, subcmds work?')
