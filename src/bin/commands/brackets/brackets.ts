import { Options } from 'yargs'

import { DemandOption, Command, RbOptions, Action, RbArgv } from '../../appTypes'

// @todo: implement a library location to rid '../../..' etc

import { parse } from '../../../lib/brackets/fns'

import { ParseData } from '../../../lib/brackets/ParseData'

// @todo: Remove this
export const command: Command = ['brackets get', 'request or save the parse for a sentence']

export const action: Action = async (argv: RbArgv) => {

    const resp = await parse(argv.sentence || argv.s)
    const json: ParseData = await resp.json()
    console.log(json)
    return argv
}

//@todo: remove this
export const demandOption: DemandOption = []

const sentence: Options = {
    alias: 's',
    description: 'sentence to parse',
    demandOption: true
}


export const options: RbOptions = {
    sentence
}

