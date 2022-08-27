import { Module } from '../../../../shared/utils/types'
import three from './three'

const cm: Module = {
    help: {
        description: 'test two',
        options: {

        },
    },
    fn: async function two(_: any, ...args: any[]) {
        if (_.throw === true) {
            throw new Error(`Fire in submodule two!!!! ${Date.now()}`)
        }
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('two ru')
                return resolve({ msg: 'from two/index.ts' })
            }, 3000)
        })
    },
    submodules: {
        three
    }
}

export default cm
