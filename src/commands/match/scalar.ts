import { Options } from 'yargs'
import { AppOptions, Action, AppArguments } from '../../appTypes'

const left: Options = {
    alias: 'l',
    description: 'left matchable',
    demandOption: true,
    type: 'array'
}

const right: Options = {
    alias: 'r',
    description: 'right matchable',
    demandOption: true,
    type: 'array'
}

export const builder: AppOptions = {
    left,
    right
}

export const command = 'scalar [options]'
export const describe = 'test and log whether -l (scalar) matches -r (scalar) with ==='

const action: Action = async (argv: AppArguments) => {
    const { left, right } = argv
    const results = left.map((l, idx) => {
        const rt = right[idx]
        return {
            index: idx,
            match: l === rt,
            left: l,
            right: rt
        }
    })
    return results
}

export const handler = async (args: AppArguments) => {
    return action(args)
}
