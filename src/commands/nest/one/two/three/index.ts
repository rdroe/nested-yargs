import { Module } from '../../../../../shared/utils/types'


const cm: Module = {
    help: {
        description: 'nest three',
        options: {
            '[none]': 'command has no options'
        },
        examples: {
            '': 'run all the ancestral commands as well as three itself.'
        }
    },
    fn: async function three(_: any, ...args: any[]) {
        console.log('three chn', args, 'three argv', _)
        return new Promise((resolve) => {
            setTimeout(() => {
                return resolve({ msg: 'from three/index.ts' })
            }, 1000)
        })
    },
}

export default cm
