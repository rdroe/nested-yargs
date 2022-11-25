import { ParallelModule } from '../../shared/utils/types'
import parse from './parse'
import one from './one'

const cm: ParallelModule<{}, { topMessage: string, childMessages: any }> = {
    parallel: true,
    help: {
        description: 'nested commands that log test code',
        options: {
            '--async': 'do not call children but rather pass the child function wrappers to the parentmost module. the parent controls calling them in whatever order it specifies'
        },
    },

    fn: async function test(_, priors) {
        const results = await Promise.all(priors.map(async ([nm, fn]: [string, Function]) => {
            const res = await fn(priors)
            return res
        }))

        return {
            topMessage: 'nested ASYNC call from parentmost',
            childMessages: results
        }

    },
    submodules: {
        one,
        parse
    }
}

export default cm
