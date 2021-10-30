import { loop } from '../../../index'
import { UserArgs, Module } from '../../appTypes'

const m: Module = {
    help: {
        description: 'run programs defined as arrays of cli commands for nyargs',
        examples: {
            'program matchTwos': `Assuming "matchTwos" is defined as ['match scalar --l 2 --r 2'], run that one-line program with nyargs. To set the dictionary of programs, import loop from the index and in your program call, for example, "loop.setDictionary({ matchTwos: ['match scalar --l 2 --r 2'] })"`
        }
    },
    fn: async (args: UserArgs<{}>) => {
        const dict = loop.getDictionary()
        const array = (args.positional as number[]).map(progIdx => dict[progIdx]).flat()
        loop.queue(array)
        return array
    }
}



export default m
