import { deps } from "../dynamic";
import readline from 'readline'

export const makeTriggerInput: ((arg1: (str: string) => void) => (str: string) => void) =
    (write) => (inp = "brackets get -s 'i go'") => {
        write(inp)
        write("\n")
    }

export const terminalUtils = {
    matchUp: (obj: any) => obj.name === 'up',
    matchDown: (obj: any) => obj.name === 'down',
    eventName: 'keypress',
    clearCurrent: (rl: { write: Function }) => {
        rl.write(null, { ctrl: true, name: 'u' });
    }
}

export const renewReader = async (pr: string, curElement: { close?: Function }) => {

    await deps.get('readline')
    curElement?.close()
    // todo: verify that readline module is totally garbage collected
    // on resetting the reference.
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: pr
    })
    return rl
}



