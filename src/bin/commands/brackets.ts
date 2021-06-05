import { Options } from 'yargs'

import { DemandOption, Command, RbOptions, Action, Lib, Module, RbArgv } from './rbTypes'

import { parse, save, SaveRequest } from '../../lib/brackets'
import { ParseData } from './ParseData'

export const command: Command = ['brackets', 'requests or saves the parse for a sentence']


export const action: Action = (thisModule: Module, argv: RbArgv) => {

    const { lib } = thisModule
    const { parse: p } = lib

    if (argv.save) {
        if (!argv.destination_roebook) {
            throw new Error('To save a parse, a destination roebook is required.')
        }

        const saveRequest: SaveRequest = {
            brackets: argv.save as string,
            destination_roebook: argv.destination_roebook as string,
            sent_at: Date.now()
        }

        const savior = save({ data: saveRequest }).then((data: any) => console.log(data))
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

const destination_roebook: Options = {
    alias: 'd',
    description: 'Roebook to which to save the parse'
}

export const options: RbOptions = {
    sentence,
    save: saveOpt,
    destination_roebook
}

export const lib: Lib = { parse }

