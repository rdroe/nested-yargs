

export * from './input/server'

const depsRef: Deps = {
} = {}


interface RenewReader {
    (arg1: string, arg2: ReadlineInterface): Promise<ReadlineInterface>
    default?: RenewReader
}

type Deps = {
    'fs'?: Promise<{
        default?: any
        writeFileSync: Function,
        readFileSync: Function
    }>,
    'shelljs'?: Promise<{
        default?: any
        mkdir: Function
    }>,
    'readline'?: Promise<Readline>,
    'historyListener'?: Promise<{
        default: any
        on: Function
    }>,
    'terminalUtils'?: Promise<{
        default?: {
            matchUp: (arg1: any) => boolean
            matchDown: (arg1: any) => boolean
            eventName: string
            clearCurrent: (arg1: any) => void
        },
        matchUp: (arg1: any) => boolean
        matchDown: (arg1: any) => boolean
        eventName: string
        clearCurrent: (arg1: any) => void
    }>,
    'renewReader'?: Promise<RenewReader>
}

interface ReadlineInterface {
    question: Function
    write: Function
    close: Function
    line: string
}

export type Readline = {
    default?: Readline
    createInterface: (arg: { input: any, output: any, prompt: any }) => ReadlineInterface
    utils?: { matchUp: Function, matchDown: Function, eventName: string },
    getInput?: (arg1: string, arg2?: string) => Promise<string>
}

type DepName = 'fs' | 'shelljs' | 'readline' | 'historyListener' | 'terminalUtils' | 'renewReader'

type Awaitable = <DN extends keyof Deps>(dn: DN) => Promise<Deps[typeof dn]>

const getDeps: Awaitable = async (dn: DepName) => {
    if (!depsRef[dn]) throw new Error(`No dep available at ${dn}`)
    return depsRef[dn].then((resolvedDep) => {
        if (resolvedDep.default) return resolvedDep.default
        return resolvedDep
    })
}

export const deps = ({
    get: getDeps,
    set: <D extends DepName>(depName: D, newDep: Deps[D]) => {
        depsRef[depName] = newDep
    }
})
