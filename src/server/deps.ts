import { promises } from 'node:fs'
import { set, get, getConfig, configure, configured } from '../shared'
import { db } from './db'
import { renewReader, terminalUtils } from './cliUtils'
import { printResult } from '../shared/utils/printResult'
import { ConfigOptions, Configuration, Result } from '../shared/utils/types'

require('source-map-support').install();

let attemptedHistory = false

const defaultConfig: Configuration = {
    // see default browser config (src/browser/deps.ts
    // for a few remarks on what each does
    server: {
        printResult,
        wrapperFn: (cmd: string) => {
            return cmd
        },
        hotkeys: {
            '-Alt-Shift-T': (currInput: any) => {
                // console.log('current contents', currInput)
            }
        },
        afterKeypress: async (ke) => { },
        processResult: async (result: Result) => {

            return result
        },
        messageUser: console.log
    }
}

export const setAll = async () => {

    Object.entries((defaultConfig.server)).forEach(<C extends keyof ConfigOptions>([key, val]: [C, ConfigOptions[C]]) => {
        if (!getConfig(key)) {
            configure('server', key, val)
        }
    })

    configured.resolver()

    set('fs', {
        writeFile: promises.writeFile,
        readFile: promises.readFile,
        mkdir: promises.mkdir
    })

    set('db', db)

    set('historyListener', {
        on: (_: any, fn: (...args: any[]) => void) => {
            process.stdin.on('keypress', fn)
        }
    })

    set('renewReader', renewReader)
    set('terminalUtils', terminalUtils)
    set('printResult', printResult)
    set('saveHistory', async (histState: { hist: string[], idx: number }) => {
        const fs = await get('fs')
        const str = JSON.stringify({ ...histState, idx: histState.hist.length }, null, 2)
        fs.mkdir('data', { recursive: true })
        fs.writeFile('data/nyargs-history', str)
    })

    set('loadHistory', async () => {
        const fs = await get('fs')
        let hist: { hist: [], idx: 0 }
        try {
            await fs.mkdir('data', { recursive: true })
            const strHist = await fs.readFile('data/nyargs-history', 'utf8')
            if (strHist) {
                return JSON.parse(strHist)
            }
            throw new Error('no good history found')
        } catch (e) {
            if (attemptedHistory === false) {
                attemptedHistory = true
                await get('saveHistory').then(async (shFn) => {
                    hist = { hist: [], idx: 0 }
                    await shFn(hist)
                    return hist

                })
                const recursiveLhFn = await get('loadHistory')
                return recursiveLhFn()
            } else {
                console.log('could not load or initialize persistent history!')
                return { hist: [], idx: 0 }
            }
        }
    })
}

set('setAll', setAll)
