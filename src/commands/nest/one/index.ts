import { Module } from '../../../shared/utils/types'
import two from './two'

const cm: Module = {
    help: {
        description: 'test one',
        options: {

        },
    },
    fn: async function() {
        return new Promise((resolve) => {
            setTimeout(() => {
                return resolve({ msg: 'from one/index.ts' })
            }, 1000)
        })
    },
    submodules: {
        two
    }
}

export default cm
