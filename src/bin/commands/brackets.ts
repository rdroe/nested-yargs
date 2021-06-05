import { Options } from 'yargs'

import { DemandOption, Command, RbOptions, Action, RbArgv } from '../appTypes'

import { parse, save } from '../../lib/brackets/fns'
import { SaveRequest } from '../../lib/brackets/types'

import { ParseData } from '../../lib/brackets/ParseData'

export const command: Command = ['brackets', 'requests or saves the parse for a sentence']

export const action: Action = async (argv: RbArgv) => {

    if (argv.save) {
        if (!argv.destination_roebook) {
            throw new Error('To save a parse, a destination roebook is required.')
        }

        const saveRequest: SaveRequest = {
            brackets: argv.save as string,
            destination_roebook: argv.destination_roebook as string,
            sent_at: Date.now()
        }

        const resp = await save(saveRequest)
        console.log(resp)
    } else {

        const resp = await parse(argv.sentence)
        const json: ParseData = await resp.json()
        console.log(json)
    }
}

export const demandOption: DemandOption = []

const sentence: Options = {
    alias: 's',
    description: 'sentence to parse'
}

const saveOpt: Options = {
    alias: 'v',
    description: 'parsed sentence to save'
}

const destination_roebook: Options = {
    alias: 'd',
    description: 'roebook identifier to which to save the parse'
}

export const options: RbOptions = {
    sentence,
    save: saveOpt,
    destination_roebook
}

