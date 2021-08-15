import { CommandModule } from 'yargs'
import hooks from './'

export const cache = (module: { builder: object }, filter = '.'): CommandModule => {
    // i don't think this is needed anymore (nor 'branch' below)
    module.builder = {
        ...module.builder,
        c: {
            alias: 'cache',
            default: filter,
            type: 'string',
            description: 'cache match'
        }
    }
    return module as CommandModule
}

export const branch = (module: Partial<CommandModule>) => {

    return {
        ...module,
        handler: () => {
            console.log('subcommand is required.', hooks)
            return hooks.resolver(false)
        }
    }
}
