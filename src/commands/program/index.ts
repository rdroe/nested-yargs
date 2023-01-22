import { getConfig } from '../../shared'
import { Module } from '../../shared/utils/types'
type Program = Array<string>
export type DictionaryInput = { [programName: string]: Program | Program[] }
type Dictionary = { [programName: string]: Program }
type ProgramRef = { array: string[], dictionary: Dictionary }

export const cliProgram: ProgramRef = {
    array: [],
    dictionary: {}
}

const isProgram = (arg: any): arg is string => {
    if (!Array.isArray(arg)) return false
    if (Array.length === 0) return false
    if (arg.find(elem => typeof elem !== 'string')) {
        return false
    }
    return true
}

const isMultiplePrograms = (arg: Program | Program[]) => {
    if (!Array.isArray(arg)) return false;
    return (arg as []).find(arr => !isProgram(arr as any[])) === undefined

}

export const queue = (stringOrProg: string | Program) => {

    let lookedUpProg: Array<string>

    if (typeof stringOrProg === 'string') {
        if (typeof cliProgram.dictionary[stringOrProg] !== 'object') {
            throw new Error(`no program or invalid program at "${stringOrProg}"`)
        }
        lookedUpProg = cliProgram.dictionary[stringOrProg]
    } else {
        lookedUpProg = stringOrProg
    }

    cliProgram.array = lookedUpProg.concat(cliProgram.array)
}

export const setDictionary = (
    newKeys: DictionaryInput
) => {
    const msg = (args: any) => `Invalid program cannot be loaded: ${JSON.stringify(args)}`
    Object.entries(newKeys).forEach(([nm, pr]: [nm: string, pr: Program | Program[]]) => {
        if (isMultiplePrograms(pr)) {
            pr.forEach((subpr, idx) => {
                const dict = { [`${nm}:${idx}`]: subpr }
                if (!isProgram(subpr)) throw new Error(msg(subpr))
                Object.assign(cliProgram.dictionary, dict)
            })
        } else if (isProgram(pr)) {
            Object.assign(cliProgram.dictionary, newKeys)
        } else {
            throw new Error(msg({ nm: pr }))
        }
    })
}

export const getDictionary = () => {
    return cliProgram.dictionary
}


const m: Module = {
    help: {
        description: 'run programs defined as arrays of cli commands for nyargs',
        examples: {
            'matchTwos': `Assuming "matchTwos" is defined as ['match scalar --l 2 --r 2'], run that one-line program with nyargs. To set the dictionary of programs, import loop from the index and in your program call, for example, "loop.setDictionary({ matchTwos: ['match scalar --l 2 --r 2'] })"`
        }
    },
    fn: async (args) => {
        const dict = getDictionary()
        if (args.positional.length === 1) {


            if (args.positional[0] === 'List') {
                const log = getConfig('messageUser')
                log(JSON.stringify(dict, null, 2))
                return null
            } else if (args.positional[0] === 'Q') {

                const log = getConfig('messageUser')
                log(JSON.stringify(cliProgram, null, 2))
                return null
            }
        }

        const array = (args.positional as number[]).map(progIdx => dict[progIdx]).flat()

        queue(array)
        return array
    }
}

export default m
