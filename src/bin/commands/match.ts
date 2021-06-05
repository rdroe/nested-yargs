
import { Options } from 'yargs'
import { DemandOption, Command, RbOptions, Action, Module, RbArgv } from './rbTypes'

const left: Options = {
    alias: 'l',
    description: 'left matchable'
}


const right: Options = {
    alias: 'r',
    description: 'right matchable'
}

export const options: RbOptions = {
    left,
    right
}



export const command: Command = ['match', 'tests whether arguments match']

export const action: Action = (argv: RbArgv) => {

    const { left, right } = argv
    console.log(`Does ${left} match ${right}`, left === right ? ' Yes!' : 'No...')
}

export const demandOption: DemandOption = ['l', 'r']

export const lib: { [fn: string]: Function } = {}

