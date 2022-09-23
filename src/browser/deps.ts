import files from './files'
import { set, get, getConfig, configure, configured } from '../shared'
import { historyListener, print, renewReader, terminalUtils, toggleTa, } from './cliUtils'
import { printResult } from '../shared/utils/printResult'
import { Configuration, ConfigOptions, Result } from '../shared/utils/types'
import { db as getDb, filesDb as getFilesDb } from './db'

const defaultConfig: Configuration = {
    browser: {
        hotkeys: {
            '-Control-Shift-K': () => toggleTa(document.querySelector('.ny-text-area'))
        },
        // configure this to alter every input string
        wrapperFn: (cmd: string) => { return cmd },
        printResult: print, // configure to determine print behavio
        afterKeypress: async (ke) => { }, // " after any keypress
        // " process all results before they are cached
        processResult: async (result: Result) => { return result },
        messageUser: console.log,
        useFakeDb: false
    }
}


export const setAll = async () => {

    Object.entries((defaultConfig.browser)).forEach(<C extends keyof ConfigOptions>([key, val]: [C, ConfigOptions[C]]) => {
        if (getConfig(key) === undefined) {
            configure('browser', key, val)
        }
    })
    configured.resolver()
    set('fs', {
        writeFile: files.write,
        readFile: files.read,
        mkdir: files.mkdir
    })
    const db = await getDb(getConfig('useFakeDb'))
    set('db', db)
    set('historyListener', historyListener)
    set('renewReader', renewReader)
    set('terminalUtils', terminalUtils)
    set('printResult', printResult)
    set('saveHistory', async (histState: { hist: string[], idx: number }): Promise<void> => {
        await (await getFilesDb(getConfig('useFakeDb'))).files.put({
            name: 'history', data: { ...histState, idx: histState.hist.length }, updatedAt: Date.now()
        })
    })


    set('loadHistory', async (): Promise<{ hist: string[], idx: number }> => {
        const filesDb = await getFilesDb(getConfig('useFakeDb'))
        let file = await filesDb.files.get('history')
        if (file && file.data) return { ...file.data, line: '' }
        const sh = await get('saveHistory')
        await sh({ hist: [], idx: 0 })
        file = await filesDb.files.get('history')
        if (!file.data) throw new Error(`Could not load history, even after trying to re-initialized fresh copy`)
        return { ...file.data, line: '' }

    })
}

set('setAll', setAll)
