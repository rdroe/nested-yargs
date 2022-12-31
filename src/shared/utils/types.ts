//import { Dexie as DexieCore } from 'dexie'

import { RESULT_KEY as RESULT_KEY_VAL } from "./const"
export const RESULT_KEY = RESULT_KEY_VAL

import { userListenerFunctions } from "./makeGetLastN"

export type SaveHistory = (histState: { hist: string[], idx: number }) => Promise<void>

export type LoadHistory = () => Promise<{
    hist: string[],
    idx: number
}>

export interface Files {
    read: (path: string, opts?: unknown) => Promise<string>
    write: (arg1: string, arg2: string, arg3?: unknown) => Promise<void>
    mkdir: (arg1: string, arg2?: string | { recursive?: boolean }) => Promise<string>
}

export type PartialFs = {
    readFile: Files['read']
    writeFile: Files['write']
    mkdir: Files['mkdir']
}

export interface Cache {
    id?: number
    names: Array<string> | '*'
    commands: Array<string> | '*'
    value: any
    createdAt: number
}

export interface DbFiles {
    name: string
    data: any
    updatedAt: number
}

export interface Hotkeys {
    [keyCombo: string]: (currInput: any) => void
}

/*
class UiDb extends DexieCore {
    public cache: DexieCore.Table<Cache>
    public constructor() {
        super("UiDb")
        this.version(1).stores({
            cache: 'id++, *names, *commands, value, [commands+names], createdAt'
        });
        this.cache = this.table('cache')
    }
}
*/

export type Db = any // InstanceType<typeof UiDb>

export interface TerminalUtils {
    default?: TerminalUtils,
    matchUp: (arg1: any) => boolean
    matchDown: (arg1: any) => boolean
    eventName: string
    clearCurrent: (rl?: ReadlineInterface) => void
}

export interface ReadlineInterface {
    question: Function
    write: Function
    close: Function
    line: string

}

export interface SingleResult {
    isMultiResult: false
    errorInfo: null | string
    [RESULT_KEY]: any
}

export interface MultiResult {
    isMultiResult: true
    errorInfo: null | string
    list: {
        [str: string]: SingleResult
    }
}

export type Result = SingleResult | MultiResult

export interface PrintResult<T extends BaseArguments = BaseArguments> {
    (argv: T, res: Result): Promise<boolean>
}

export type Readline = {
    default?: Readline
    createInterface: (arg: { input: any, output: any, prompt: any }) => ReadlineInterface
    utils?: { matchUp: Function, matchDown: Function, eventName: string },
    getInput?: (arg1: string, arg2?: string) => Promise<string>
}

export type KeyListener = userListenerFunctions | userListenerFunctions['fn']
export type UserListenerFns = userListenerFunctions
export interface HistoryListener {
    on: (evName: string, id: number, fn: (...args: any[]) => boolean) => boolean
}

export interface RenewReader {
    (arg1: string, arg2?: number, arg3?: ReadlineInterface): Promise<ReadlineInterface>
}

export interface ModuleHelp {
    description: string,
    options?: object,
    examples?: object
}

export type JsonObjects = Array<string>

type SubmoduleResult = ReturnType<Module['fn']>
export type Modules = Record<string, Module>
type AnyModule = {
    fn: ModuleFn<any, any>,
    help?: ModuleHelp,
    yargs?: {
        [optName: string]: any
    }
    submodules?: {
        [submoduleName: string]: AnyModule
    }
}

export type SyncChildCalls = { [childCommandNames: string]: SubmoduleResult }

export type ParallelChildCalls = [childCommandNames: string, submoduleWrapperFn: Function][]

export type ModuleFn<X, ReturnType> = (argv: BaseArguments & X, submodulePromises: SyncChildCalls) => Promise<ReturnType>

export type ParallelModuleFn<X, ReturnType = any> = (argv: BaseArguments & X, submodulePromises: ParallelChildCalls) => Promise<ReturnType>

export type Module<T = any, R = any> = SyncModule<T, R>

export type SyncModule<UserArguments = {}, ReturnType = any> = {
    fn: ModuleFn<UserArguments, ReturnType>
    help?: ModuleHelp,
    yargs?: {
        [optName: string]: any
    }
    parallel?: false
    submodules?: {
        [submoduleName: string]: AnyModule
    }
}

export type ParallelModule<UserArguments = {}, ReturnType = any> = {
    fn: ParallelModuleFn<UserArguments, ReturnType>
    help?: ModuleHelp,
    yargs?: {
        [optName: string]: any
    }
    parallel: true
    submodules: {
        [submoduleName: string]: AnyModule
    }
}
export type ModuleArgs<T = {}> = Parameters<Module<T>['fn']>

export interface BaseArguments {
    'c:c': string[] // commands index for put to cache
    'c:n': string[]  // namse index for put to cache 
    filters: string[]
    positional: (string | number)[]
    _: (string | number)[]
    c?: any
    help?: boolean
    logArgs?: boolean
}

export interface NodeKeypress {
    meta: boolean
    ctrl: boolean
    shift: boolean
    sequence: string
    name: string
}

export interface ConfigOptions {
    printResult?: PrintResult
    wrapperFn?: (cmd: string, modules?: Modules) => string
    hotkeys?: Hotkeys
    afterKeypress?: (ke: KeyboardEvent | NodeKeypress) => Promise<void>
    processResult?: (result: Result) => Promise<any>
    messageUser?: (...messages: any) => void
    useFakeDb?: boolean
    init?: (...args: any[]) => any
}

export interface Configuration {
    shared?: ConfigOptions
    browser?: ConfigOptions
    server?: ConfigOptions
}

export const keyofConfigOptions: (keyof ConfigOptions)[] = ['printResult', 'hotkeys', 'wrapperFn', 'afterKeypress', 'processResult', 'messageUser', 'useFakeDb', 'init']

export type SetAll = () => Promise<void>
export type Repl = (modules: {
    [moduleName: string]: Module<any, any> | ParallelModule<{}, any>
}, yargs: any, prompt: string) => Promise<any>


