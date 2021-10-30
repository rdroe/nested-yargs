import { loop } from '../../../index'
import { UserArgs, Module } from '../../appTypes'

const m: Module = {
    help: {
        description: 'run programs saved in program.ts'
    },
    fn: async () => {
        return [] as any[]
    },
    submodules: {
        test: {
            help: {
                description: ''
            },
            fn: async (args: UserArgs<{}>) => {
                const dict = loop.getDictionary()
                const array = (args.positional as number[]).map(progIdx => dict[progIdx]).flat()

                loop.queue(array)
                return array
            }
        }
    }
}

export default m
