import { Options } from 'yargs'
import { AppOptions, Action, AppArgv } from '../../appTypes'

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

export const builder: AppOptions = {
    left,
    right
}

export const describe = 'test and log whether -l (scalar) matches -r (scalar) with ==='

export const action: Action = (argv: AppArgv) => {
    const { left, right }: { [k: string]: string | number } = argv
    console.log(`Does ${left} match ${right}`, left === right ? ' Yes!' : 'No...')
}

