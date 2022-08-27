import { Module } from '../../../../../shared/utils/types'


const cm: Module = {
    help: {
        description: 'nest three',
        options: {

        },
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
