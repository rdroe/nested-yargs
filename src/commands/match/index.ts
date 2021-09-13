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
        console.log('Running 1+ matches...')
    },
    submodules: {
        scalar
    }
}

export default cm
