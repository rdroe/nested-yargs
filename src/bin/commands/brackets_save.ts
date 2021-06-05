import { Options } from 'yargs'

import { DemandOption, Command, RbOptions, Action, RbArgv } from '../appTypes'

import { save } from '../../lib/brackets/fns'
import { SaveRequest } from '../../lib/brackets/types'

export const command: Command = ['brackets save', 'saves the parse for a sentence']

export const action: Action = async (argv: RbArgv) => {
    const saveRequest: SaveRequest = {
        brackets: argv.save as string,
        destination_roebook: argv.destination_roebook as string,
        sent_at: Date.now()
    }

    const resp = await save(saveRequest)
    console.log(resp)

}

export const demandOption: DemandOption = []

const saveOpt: Options = {
    alias: 'v',
    description: 'parsed sentence to save'
}

const destination_roebook: Options = {
    alias: 'd',
    description: 'roebook identifier to which to save the parse'
}

export const options: RbOptions = {
    save: saveOpt,
    destination_roebook
}

