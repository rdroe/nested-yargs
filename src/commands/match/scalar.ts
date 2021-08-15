import { Options } from 'yargs'
import { AppOptions, Action, AppArgv } from '../../appTypes'
import hooks from '../../hooks'
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

const action: Action = async (argv: AppArgv) => {
    const { left, right } = argv

    const results = (left as Array<string | number>).map((l, idx) => {
        const rt = (right as Array<string | number>)[idx]
        return {
            index: idx,
            match: l === rt,
            left: l,
            right: rt
        }
    })
    console.log('resluts = ', results)
    if (hooks.resolver) return hooks.resolver({ result: results, argv })
    return results

}

export const handler = async (args: AppArgv) => {
    return action(args)
}
