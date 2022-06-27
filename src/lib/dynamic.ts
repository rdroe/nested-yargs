import { Result } from '../appTypes'
import { Dexie } from 'dexie'

export const isNode = () => {

    try {
        const fn = new Function("try { return window.document === undefined } catch(e) { return true; }")
        return fn()
    } catch (e) {
        console.log('presuming browser environment because isNode() errored out')
        return false
    }
}
const depsRef: Deps = {
} = {}

let initResolve: Function
const init = new Promise((resolve) => {
    initResolve = resolve
})

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

interface TerminalUtils {
    default?: TerminalUtils,
    matchUp: (arg1: any) => boolean
    matchDown: (arg1: any) => boolean
    eventName: string
    clearCurrent: (rl?: ReadlineInterface) => void
}

type PartialFs = {
    default?: PartialFs
    writeFileSync: Function,
    readFileSync: Function,
    readFile?: Function
}

type Deps = {
    'fs'?: Promise<PartialFs>,
    'shelljs'?: Promise<{
        default?: any
        mkdir: Function
    }>,
    // todo: delete this realine pretty sure.
    'readline'?: Promise<Readline>,
    'historyListener'?: Promise<HistoryListener>,
    'terminalUtils'?: Promise<TerminalUtils>,
    'renewReader'?: Promise<RenewReader>,
    'printResult'?: Promise<PrintResult>,
    'db'?: Promise<Db>,
    'Dexie'?: Promise<DexieType>
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


type DepName = 'fs' | 'shelljs' | 'readline' | 'historyListener' | 'terminalUtils' | 'renewReader' | 'printResult' | 'db' | 'Dexie'

type Awaitable = <DN extends keyof Deps>(dn: DN) => Promise<Deps[typeof dn]>

const getDeps: Awaitable = async (dn: DepName) => {
    await init

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

type DexieType = (typeof Dexie)

type Db = any


export const setDeps = ({ historyListener, terminalUtils, renewReader, printResult, readline, fs, shelljs, db, Dexie }: {
    historyListener: HistoryListener,
    terminalUtils: TerminalUtils,
    renewReader: RenewReader,
    printResult: PrintResult,
    readline: Readline,
    fs: PartialFs,
    shelljs: {
        mkdir: Function, default?: { mkdir: Function }

    },
    db: Db,
    Dexie: DexieType

}) => {

    deps.set('fs', Promise.resolve(fs))
    deps.set('shelljs', Promise.resolve(shelljs))
    deps.set('historyListener', Promise.resolve(historyListener))
    deps.set('terminalUtils', Promise.resolve(terminalUtils))
    deps.set('renewReader', Promise.resolve(renewReader))
    deps.set('readline', Promise.resolve(readline))
    deps.set('printResult', Promise.resolve(printResult))
    deps.set('db', Promise.resolve(db))
    deps.set('Dexie', Promise.resolve(Dexie))
    initResolve()
}

export const commands = () => {

    if (isNode()) {

    }
}

