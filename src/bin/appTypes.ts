

import { Options } from 'yargs'

export type DemandOption = string[]

export type AppOptions = {
    [prop: string]: Options
}

export interface Action {
    (argv: AppArgv): void
}


export type AppArgv = {
    [arg: string]: string | number
}

