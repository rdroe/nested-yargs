

import { Options } from 'yargs'

export type DemandOption = string[]

export type AppOptions = {
    [prop: string]: Options
}

export interface Action {
    (argv: AppArgv): void
}


export type AppArgv = {
    [arg: string]: string | number | Array<string | number>
}

export type AppArguments = {
    c: string,
    cache: string,
    s: string,
    sentence: string,
    result: any
}
