
import { Options, Argv } from 'yargs'

export type DemandOption = string[]
export type Command = [string, string]
export type RbOptions = {
    [prop: string]: Options
}

export interface Action {
    (module: Module, argv: RbArgv): void
}

export interface Lib {
    [functionName: string]: Function
}

export interface Module {
    command: Command
    action: Action
    lib: Lib
    options: RbOptions
    demandOption: DemandOption
}


export type RbArgv = {
    [arg: string]: string | number
    sentence?: string
    left?: string | number
    right?: string | number
    brackets?: string
    destination_roebook?: string | number
}

