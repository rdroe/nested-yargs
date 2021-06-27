import { Options } from 'yargs'

import { RbOptions, Action, RbArgv } from '../../appTypes'

import { parse } from '../../../lib/brackets/fns'

import { ParseData } from '../../../lib/brackets/ParseData'

export const action: Action = async (argv: RbArgv) => {
    const resp = await parse(argv.sentence || argv.s)
    const json: ParseData = await resp.json()
    console.log(json)
    return argv
}

const sentence: Options = {
    alias: 's',
    description: 'sentence to parse',
    demandOption: true
}

export const options: RbOptions = {
    sentence
}

