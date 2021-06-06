

import { Options } from 'yargs'

export type DemandOption = string[]
export type Command = [string, string]
export type RbOptions = {
    [prop: string]: Options
}

export interface Action {
    (argv: RbArgv): void
}

export interface Module {
    command: Command
    action: Action
    options: RbOptions
}


export type RbArgv = {
    [arg: string]: string | number
    sentence?: string
    s?: string
    left?: string | number
    right?: string | number
    brackets?: string
    destination_roebook?: string | number
}

