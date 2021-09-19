import { Options, Arguments } from 'yargs'

export type DemandOption = string[]

export type AppOptions = {
    [prop: string]: Options
}

export interface Action {
    (argv: AppArguments): void
}

export type AppArgv = {
    [arg: string]: string | number | Array<string | number>
}

export interface Modules {
    [moduleName: string]: Module
}

export interface Module {
    fn: Function,
    help: {
        options: object,
        commands: object,
        examples?: {
        }
    },
    yargs?: {
        [optName: string]: Options
    }
    submodules?: Modules
}

export type AppArguments = Arguments<{
    c: string, // how to cache 
    cache: string, // how to cache 
    s: string, // sentence to get brackets for
    sentence: string,  // ''
    result: any | object, // passenger result by command
    object: string[], // cache command: object
    'c:c': string[], // commands index for put to cache
    'c:n': string[],  // namse index for put to cache 
    scalar: (string | number)[], // cache command : scalar 
    _jq: string, // jq search pattern for cache
    jq: string,
    id: number,
    i: number,
    left: (string | number)[],  // match arg
    right: (string | number)[],  // match arg
    f: string,
    filename: string,
    p: string,
    path: string,
    positional: (string | number)[]
}>

interface SingleResult {
    isMultiResult: false
    argv: AppArguments
    result: any
}
interface MultiResult {
    isMultiResult: true
    list: {
        [str: string]: any
    }
    argv: {
        [str: string]: any
    }
}
export type Result = SingleResult | MultiResult
