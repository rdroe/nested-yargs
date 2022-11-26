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
        '--c / --count': "Instead of the last return last [count] number of results"
    }
}

const name = makeModule('name', async ({ positional, count, c, nth, n }: { positional: string[], count?: number, c?: number, nth?: number, n?: number }) => {

    const cnt: number = numberType(count) ? count : numberType(c) ? c : 0
    const all = await store.where({
        commands: [],
        names: positional,
        filters: []
    })

    if (!all || !all.length) return null

    if ((cnt + 1) >= all.length) return all

    if (cnt > 0) return all.slice(all.length - cnt)

    const nth_ = numberType(nth) ? nth : numberType(n) ? n : 0

    return all[all.length - (n + nth_)]


}, { ...sharedHelp, ...nmExamples })

const numberType = (arg: any) => typeof arg === 'number'
const command = makeModule('command', async ({ positional, count, c, nth, n }: { positional: string[], count?: number, c?: number, nth?: number, n?: number }) => {

    const cnt: number = numberType(count) ? count : numberType(c) ? c : 0
    const all = await store.where({
        commands: positional,
        names: [],
        filters: []
    })

    if (!all || !all.length) return null

    if ((cnt + 1) >= all.length) return all

    if (cnt > 0) return all.slice(all.length - cnt)

    const nth_ = numberType(nth) ? nth : numberType(n) ? n : 0

    return all[all.length - (n + nth_)]


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
