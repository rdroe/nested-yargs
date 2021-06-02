
import { Options } from 'yargs'

const left: Options = {
    alias: 'l',
    description: 'left matchable'
}


const right: Options = {
    alias: 'r',
    description: 'right matchable'
}

export const options = {
    left,
    right
}



export const command: [string, string] = ['match', 'tests whether arguments match']

export const action = (_: any, argv: { [prop: string]: any }) => {

    const { left, right } = argv
    console.log(`Does ${left} match ${right}`, left === right ? ' Yes!' : 'No...')
}

export const demandOption = ['l', 'r']

export const lib: { [fn: string]: Function } = {}

