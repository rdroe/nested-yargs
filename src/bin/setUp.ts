import { CommandModule } from 'yargs'
import matchCmd from './commands/match'
const yargs = require('yargs')
const match: CommandModule = matchCmd
export default (modules: CommandModule[]) => {
    yargs.usage("$0 command")
    const allModules: CommandModule[] = modules
    allModules.push(match)
    allModules.forEach((module: CommandModule) => {

        yargs.command(module).argv
    })
    yargs.help('help')
}
