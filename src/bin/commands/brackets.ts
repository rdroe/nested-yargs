import { Options } from 'yargs'

import { parse } from '../../lib/brackets'

export const command: [string, string] = ['brackets', 'requests the parse for a sentence']

export const action = (thisModule: { [prop: string]: object | string, command: [string, string], lib: { parse?: Function } }, argv: { _: unknown, [prop: string]: any }) => {

    const { lib } = thisModule
    const { parse } = lib

    if (parse) {
        parse(argv.sentence).then((data: any) => {
            data.json().then((json: any) => {
                console.log(json)
            })
        })
    }
}

export const demandOption = ['sentence']

const sentence: Options = {
    alias: 's',
    description: 'sentence to parse'
}

export const options = {
    sentence
}

export const lib = { parse }

