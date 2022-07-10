import { setDeps } from "../../dynamic"
import { Result } from "../../../appTypes";
import { deps } from "../../dynamic";

const printResult = async (result: Result): Promise<boolean> => {
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

const makeTriggerInput: ((arg1: (str: string) => void) => (str: string) => void) =
    (write) => (inp = "brackets get -s 'i go'") => {
        write(inp)
        write("\n")
    }

const terminalUtils = {
    matchUp: (obj: any) => obj.name === 'up',
    matchDown: (obj: any) => obj.name === 'down',
    eventName: 'keypress',
    clearCurrent: (rl: { write: Function }) => {
        rl.write(null, { ctrl: true, name: 'u' });
    }
}

const renewReader = async (pr: string, curElement: { close?: Function }) => {

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


import fs from 'fs'
import shelljs from 'shelljs'
import readline from 'readline'
import { db, Dexie } from './db'
import { Arguments } from "yargs";

/*
    readFileSync: (path: string, encoding: string, basePath: string = '.') => {
        console.warn('Cannot read files synchronously in browser; relapsing to async.')
        return readFile(path, encoding, {}, basePath)

    },
const readFile = async (path: string, encoding: string, params: QueryParams = {}, basePath: string = '.'): Promise<string> => {
    const fullPath = `${basePath}/${path}`
    const convertedEncoding = getTextEncoding(encoding)

    return get(fullPath, params, {})
        .then(async (response) => {
            return response.text()
        })
}

type PartialFs = {
    default?: PartialFs
    writeFileSync: Function,
    readFileSync: (path: string, encoding: string, opts: any) => Promise<string>,
    readFile?: (path: string, encoding: string, params?: QueryParams, basePath?: string) => Promise<string>
}
    
*/


setDeps({
    fs: {
        readFileSync: async (path: string, encoding: string, opts: any): Promise<string> => {
            const returnable = fs.readFileSync(path, { encoding, ...opts })
            if (typeof returnable === 'string') {
                return returnable
            }
        },
        readFile: async (path: string, encoding: string, opts: any): Promise<string> => {
            const returnable = fs.readFileSync(path, { encoding, ...opts })
            if (typeof returnable === 'string') {
                return returnable
            }
        },
        writeFileSync: fs.writeFileSync
    },
    shelljs,
    readline,
    historyListener: {
        on: (_: any, fn: (...args: any[]) => void) => {
            process.stdin.on('keypress', fn)
        }, default: null
    },
    terminalUtils,
    renewReader,
    printResult,
    db,
    Dexie
})
