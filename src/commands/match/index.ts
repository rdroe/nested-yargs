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
    fn: async function match() {
        // parent command: runs before children as of this version.
        console.log('Running 1+ matches...')
    },
    submodules: {
        scalar // child command
    }
}

export default cm
