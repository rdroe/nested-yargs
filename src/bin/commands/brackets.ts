import { Options } from 'yargs'

import { DemandOption, Command, RbOptions, Action, Lib, Module, RbArgv } from './rbTypes'

import { parse, save } from '../../lib/brackets'
import { ParseData } from './ParseData'

export const command: Command = ['brackets', 'requests or saves the parse for a sentence']

export const action: Action = (thisModule: Module, argv: RbArgv) => {

    const { lib } = thisModule
    const { parse: p } = lib

    if (argv.save) {
        const savior = save({ data: argv.save }).then((data: any) => console.log(data))
        return console.log(savior)
    }

    p(argv.sentence).then((fetchResponse: Response) => {
        fetchResponse.json().then((json: ParseData) => {
            console.log(json)
        })
    })

}

export const demandOption: DemandOption = []

const sentence: Options = {
    alias: 's',
    description: 'sentence to parse'
}

const saveOpt: Options = {
    alias: 'v',
    description: 'ParseData to save'
}

export const options: RbOptions = {
    sentence,
    save: saveOpt
}

export const lib: Lib = { parse }

