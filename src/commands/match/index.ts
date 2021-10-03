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
    fn: async function match(_: any, y: {
        [childNamespace: string]: Promise<any>
    }) {
        const childResults = await Promise.all(Object.values(y))
        return childResults.flat().length
    },
    submodules: {
        scalar // child command
    }
}

export default cm
