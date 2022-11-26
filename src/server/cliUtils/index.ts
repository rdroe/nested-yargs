import readline from 'readline'

import { ReadlineInterface } from '../../shared/utils/types';

export const terminalUtils = {
    matchUp: (obj: any) => obj.name === 'up',
    matchDown: (obj: any) => obj.name === 'down',
    eventName: 'keypress',
    clearCurrent: (rl: { write: Function }) => {
        rl.write(null, { ctrl: true, name: 'u' });
    }
}

export const renewReader = async (pr: string, curElement: { close?: Function }) => {
    curElement?.close()
    // todo: verify that readline module is totally garbage collected
    // on resetting the reference.
    const rl: ReadlineInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: pr
    })

    return rl
}
