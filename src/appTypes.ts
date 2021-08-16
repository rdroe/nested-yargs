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

export type AppArguments = Arguments<{
    c: string,
    cache: string,
    s: string,
    sentence: string,
    result: any,
    object: string[],
    'c:c': string[],
    'c:n': string[],
    scalar: (string | number)[],
    _jq: string,
    left: (string | number)[],
    right: (string | number)[]
}>
