import { Module } from '../../shared/utils/types'
import { makeModule, } from '../../shared/helpers'
import { store } from '../../runtime/exports'

const cmdExamples = {
    examples: {
        'match scalar': `Return the last result (value property) for the command "match scalar" `,
        'match scalar --c 1': `Return the NEXT TO last result (value property) for the command "match scalar" `
    }
}

const nmExamples = {

    examples: {
        'someName': `Return the last result (value property) for any command in which the option "--c:n someName" was passed, thereby "naming" it with the "someName" string`,
        'someName --count 1': `Return the NEXT TO last result (value property) for any command in which the option "--c:n someName"  was passed, thereby "naming" it with the "someName" string`
    }
}

const sharedHelp = {
    description: "Return the last value returned by some specified nyargs use",
    options: {
        '--c / --count': "Instead of the last return last - nth"
    }
}

const name = makeModule('name', async ({ positional, count, c }: { positional: string[], count?: number, c?: number }) => {
    const n: number = numberType(count) ? count : numberType(c) ? c : 0
    const all = await store.where({
        commands: [],
        names: positional,
        filters: []
    })

    if (!all || !all.length) return null

    if (n + 1 >= all.length) return all[0]

    return all[all.length - (n + 1)]
}, { ...sharedHelp, ...nmExamples })

const numberType = (arg: any) => typeof arg === 'number'
const command = makeModule('command', async ({ positional, count, c }: { positional: string[], count?: number, c?: number }) => {

    const n: number = numberType(count) ? count : numberType(c) ? c : 0
    const all = await store.where({
        commands: positional,
        names: [],
        filters: []
    })

    if (!all || !all.length) return null

    if (n + 1 >= all.length) return all[0]

    return all[all.length - (n + 1)]


}, { ...sharedHelp, ...cmdExamples })


const cm: Module<{}> = {
    help: {
        description: 'Returns the last value returned by a command  given by "name" or "command" namespace'
    },
    fn: async function scalarMatch() { },
    submodules: {
        ...name,
        ...command
    }
}

export default cm
