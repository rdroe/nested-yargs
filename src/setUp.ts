import yargs, { CommandModule } from 'yargs'

import { AppOptions, Action, AppArgv } from './appTypes'

export const stem = (nm: string, subs: CommandModule[], desc: string = nm) => {
    const subOrSubs = subs[0] && typeof subs[0].builder === 'object' ? 'sub' : 'sub..'
    const cmd = `${nm} [${subOrSubs}] [options]`
    return {
        command: cmd,
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
            action(args as AppArgv)
        }
    }
}

export default (modules: CommandModule[]) => {
    yargs.usage("$0 command")
    const allModules: CommandModule[] = modules
    allModules.forEach((module: CommandModule) => {
        yargs.command(module).argv
    })
    yargs.help('help').alias('help', 'h')
}
