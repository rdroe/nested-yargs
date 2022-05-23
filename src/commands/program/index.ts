import * as loop from '../../loop'
import { UserArgs, Module } from '../../appTypes'

const m: Module = {
    help: {
        description: 'run programs defined as arrays of cli commands for nyargs',
        examples: {
            'program matchTwos': `Assuming "matchTwos" is defined as ['match scalar --l 2 --r 2'], run that one-line program with nyargs. To set the dictionary of programs, import loop from the index and in your program call, for example, "loop.setDictionary({ matchTwos: ['match scalar --l 2 --r 2'] })"`
        }
    },
    fn: async (args: UserArgs<{}>) => {
        console.log('args', args, loop.getDictionary)
        const dic2 = loop.program
        console.log('direct dict:', dic2)
        const dict = loop.getDictionary()
        console.log('dict2', dict)
        if (args.positional.length === 1) {
            if (args.positional[0] === 'List') {
                console.log('Program dictionary:')
                console.log(JSON.stringify(dict, null, 2))
                return null
            }
        }
        const array = (args.positional as number[]).map(progIdx => dict[progIdx]).flat()
        loop.queue(array)
        return array
    }
}

export default m
