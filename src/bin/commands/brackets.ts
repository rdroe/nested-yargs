import { Options } from 'yargs'

import { DemandOption, Command, RbOptions, Action, Lib, Module, RbArgv } from './rbTypes'

import { parse } from '../../lib/brackets'
import { ParseData } from './ParseData'

export const command: Command = ['brackets', 'requests the parse for a sentence']

export const action: Action = (thisModule: Module, argv: RbArgv) => {

    const { lib } = thisModule
    const { parse } = lib

    if (parse) {
        parse(argv.sentence).then((fetchResponse: Response) => {
            fetchResponse.json().then((json: ParseData) => {
                console.log(json)
            })
        })
    }
}

export const demandOption: DemandOption = ['sentence']

const sentence: Options = {
    alias: 's',
    description: 'sentence to parse'
}

export const options: RbOptions = {
    sentence
}

export const lib: Lib = { parse }

