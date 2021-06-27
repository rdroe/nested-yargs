import { Options } from 'yargs'
import { RbOptions, Action, RbArgv } from '../../appTypes'

const left: Options = {
    alias: 'l',
    description: 'left matchable',
    demandOption: true
}


const right: Options = {
    alias: 'r',
    description: 'right matchable',
    demandOption: true
}

export const builder: RbOptions = {
    left,
    right
}

export const command = 'scalar [options]'
export const describe = 'test and log whether -l (scalar) matches -r (scalar) with ==='

const action: Action = (argv: RbArgv) => {
    const { left, right } = argv
    console.log(`Does ${left} match ${right}`, left === right ? ' Yes!' : 'No...')
}

export const handler = (args: RbArgv) => {
    action(args)
}

