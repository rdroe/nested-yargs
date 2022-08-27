import files from './files'
import { set, get, getConfig, configure, configured } from '../shared'
import { db, filesDb } from './db'
// import { db as fakeDb } from './db/fake'
import { historyListener, print, renewReader, terminalUtils, toggleTa, } from './cliUtils'
import { printResult } from '../shared/utils/printResult'
import { Configuration, ConfigOptions, Result } from '../shared/utils/types'

const USE_FAKE_DB = false
const defaultConfig: Configuration = {
    browser: {
        hotkeys: {
            '-Control-Shift-K': () => toggleTa(document.querySelector('.ny-text-area'))
        },
        // configure this to alter every input string
        wrapperFn: (cmd: string) => { return cmd },
        printResult: print, // configure to determine print behavior
        afterKeypress: async (ke) => { }, // " after any keypress
        // " process all results before they are cached
        processResult: async (result: Result) => { return result },
        messageUser: console.log
    }

}


export const setAll = async () => {

    Object.entries((defaultConfig.browser)).forEach(<C extends keyof ConfigOptions>([key, val]: [C, ConfigOptions[C]]) => {
        if (!getConfig(key)) {
            configure('browser', key, val)
        }
    })
    configured.resolver()
    set('fs', {
        writeFile: files.write,
        readFile: files.read,
        mkdir: files.mkdir
    })

    set('db', /* USE_FAKE_DB ? fakeDb : */ db)

    set('historyListener', historyListener)

    set('renewReader', renewReader)
    set('terminalUtils', terminalUtils)
    set('printResult', printResult)
    set('saveHistory', async (histState: { hist: string[], idx: number }): Promise<void> => {
        await filesDb.files.put({
            name: 'history', data: { ...histState, idx: histState.hist.length }, updatedAt: Date.now()
        })
    })

    set('loadHistory', async (): Promise<{ hist: string[], idx: number }> => {

        const file = await filesDb.files.get('history')
        if (file && file.data) return { ...file.data, line: '' }
        const sh = await get('saveHistory')
        await sh({ hist: [], idx: 0 })
        const file2 = await filesDb.files.get('history')
        if (!file2.data) throw new Error(`Could not load history, even after trying to re-initialized fresh copy`)
        return { ...file.data, line: '' }

    })
}

set('setAll', setAll)


