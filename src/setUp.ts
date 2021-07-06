import yargs, { CommandModule } from 'yargs'
import { AppOptions, Action } from './appTypes'

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


export default (modules: CommandModule[]) => {
    yargs.usage("$0 command")
    const allModules: CommandModule[] = modules
    allModules.forEach((module: CommandModule) => {
        yargs.command(module).argv
    })
    yargs.help('help')
}
