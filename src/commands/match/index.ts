
import { Argv } from 'yargs'
import { Module } from '../../appTypes'
import scalar from './scalar'

const cm: Module = {
    help: {
        commands: {
            '$': 'test whether specified option values are equal'
        },
        options: {
        },
        examples: {
        }
    },
    fn: async function match(args: Argv) {
        console.log('Running 1+ matches...')
    },
    submodules: {
        scalar
    }
}

export default cm

/**
To  replace yargs as engine:
- for imported array, enhash description properties of arguments and subcommands.
- write a 'help' function, explicitly
**/
