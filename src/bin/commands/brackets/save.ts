import { Options } from 'yargs'

import { DemandOption, RbOptions, Action, RbArgv } from '../../appTypes'

import { save } from '../../../lib/brackets/fns'
import { SaveRequest } from '../../../lib/brackets/types'


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
    description: 'parsed sentence to save',
    demandOption: true
}

const destination_roebook: Options = {
    alias: 'd',
    description: 'roebook identifier to which to save the parse',
    demandOption: true
}

export const options: RbOptions = {
    save: saveOpt,
    destination_roebook
}

