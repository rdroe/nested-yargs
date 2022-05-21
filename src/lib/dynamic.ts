import { Result } from '../appTypes'

export const isNode = new Function("try { return document.window === undefined } catch(e) { return true; }")

const depsRef: Deps = {
} = {}


export interface HistoryListener {
    default?: any
    on: Function
}

export interface RenewReader {
    (arg1: string, arg2: ReadlineInterface, htmlContainer?: any): Promise<ReadlineInterface>
    default?: RenewReader
}

interface PrintResult {
    (arg1: Result): Promise<boolean>
    default?: PrintResult
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
    // todo: delete this realine pretty sure.
    'readline'?: Promise<Readline>,
    'historyListener'?: Promise<HistoryListener>,
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
    'renewReader'?: Promise<RenewReader>,
    'printResult'?: Promise<PrintResult>
}

export interface ReadlineInterface {
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


type DepName = 'fs' | 'shelljs' | 'readline' | 'historyListener' | 'terminalUtils' | 'renewReader' | 'printResult'

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


