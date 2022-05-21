import { Result } from "../../../appTypes";
import { deps } from "../../dynamic";

export const printResult = async (result: Result): Promise<boolean> => {
    if (result.argv.help === true) {
        return true
    }
    if (!result.isMultiResult) {
        console.log(result)
        return true
    } else {
        let didLog = false
        Object.entries(result.list).forEach(([idx, res]) => {
            console.log(`${idx} result:`)
            console.log(res)
            didLog = true
            if (result.argv[idx].logArgs === true) {
                console.log(`${idx} computed arguments:`)
                console.log(result.argv[idx])
                console.log('all args:')
                console.log(result)
            }
        })
        return didLog
    }
}

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

    const readline = await deps.get('readline')
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



