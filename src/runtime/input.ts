import { get, getConfig } from '../shared/index'
import { queue } from '../shared/utils/queue'
import { Readline, Modules, HistoryListener } from '../shared/utils/types'
import isNode from '../shared/utils/isNode'
import { makeGetLastN, lastFive, userListeners, userListenerFunctions } from '../shared/utils/makeGetLastN'
import { caller } from './setUp'
import { RESULT_KEY } from '../shared/utils/const'

export { userListeners, addListener } from '../shared/utils/makeGetLastN'

export const fakeCli: {
    modules: Modules | null
    handle: (str: string) => Promise<{ argv: object, [RESULT_KEY]: object }>
} = {
    modules: null,
    handle: async (str: string) => {


        const fn = await caller.get
        const answer = await fn(fakeCli.modules, str)


        return await answer
    }
}

const makeHandleQuestion = (res: Function, modules: Modules) => {

    return function handleQuestion(rawPreInput: string): string {

        let inp: string
        const wrapperFn = getConfig('wrapperFn')

        const rawInput = wrapperFn(rawPreInput, modules)
        const splitted = rawInput.split('\n').filter(elem => !!elem)

        inp = splitted.shift()
        if (splitted.length) {
            queue(splitted)
        }

        if (inp && inp.trim && inp.trim() && rawInput && rawInput !== 'undefined') {
            // histState.hist.push(rawInput)
            addHistory(rawInput)

        }

        curReadline.close() // note: no-op in browser

        // histState.idx = histState.hist.length
        histIdx(histState.hist.length)


        return res(inp)
    }
}

const getLastN = makeGetLastN()

function recordKeypress(keyboardEvent: KeyboardEvent): void {
    lastFive.push(keyboardEvent)
    if (lastFive.length === 6) {
        lastFive.shift()
    }
}


const findKeypressMatch = (hotkeys: { [keys: string]: Function }): [string, Function] => {
    const last2 = getLastN(true, 2)
    const last3 = getLastN(true, 3)
    const ret = Object.entries(hotkeys).find(([key, fn]) => [last2, last3].filter(elem => !!elem).includes(key))

    return ret
}

// lastFive.map(ev => ev.preventDefault())

export let curReadline: ReturnType<Readline['createInterface']>
let didInitHistory = false

type FnGetInput = (modules: Modules, pr: string, initialInput?: string) => Promise<string>

let _getInput: Promise<FnGetInput>

let histState: {
    hist: string[],
    idx: number,
    line?: string
} = {
    hist: [],
    idx: 0,
    line: undefined
}

const addHistory = (line: string) => {

    if (line) {
        histState.hist.push(line)
    }

    get('saveHistory').then((saveHistory) => {
        saveHistory(histState)
    })

}

const loadHist = async () => {
    const lhFn = await get('loadHistory')
    const data = await lhFn()
    histState = data

}

const histIdx = (idx: number) => {
    histState.idx = idx
}


const initHistory = async (clearCurrent: Function, write: Function, historyListener: HistoryListener, hs: { hist: string[], idx: number, line?: string }, utils: { matchUp: Function, matchDown: Function, eventName: string }) => {

    const { matchUp, matchDown, eventName } = utils
    const hotkeys = getConfig('hotkeys')
    const afterKeypress = getConfig('afterKeypress')

    historyListener.on(eventName, (_: any, obj: KeyboardEvent) => {

        if (obj.type && obj.type === 'keydown') {
            recordKeypress(obj)
        }

        if (obj.type && obj.type !== eventName) {
            return false
        }



        const matches = findKeypressMatch(hotkeys)
        // if the up arrow is pressed, clear the current terminal contents.
        if (matchUp(obj)) {
            // if we are at the extent of history
            if (hs.line || hs.idx === hs.hist.length) {
                // push in the current contents.
                // histState.hist.push(histState.line)
                addHistory(hs.line)
            }

            // clear current and...
            clearCurrent(curReadline)
            // back up the ticker 
            //histState.idx = Math.max(0, histState.idx - 1)
            histIdx(Math.max(0, hs.idx - 1))

            // and write to cursor the new one
            if (hs.hist[hs.idx] === undefined) return true
            write(hs.hist[hs.idx])
        } else if (matchDown(obj)) {
            // if down arrow, add one (but hold at length - 1)
            // histState.idx = Math.min(histState.hist.length - 1, histState.idx + 1)
            histIdx(Math.min(hs.hist.length, hs.idx + 1))
            // clear, then write
            clearCurrent(curReadline)
            write(hs.hist[hs.idx] ?? '')
        } else if (matches && matches[1]) {
            matches[1](curReadline.line)
        }

        //        setTimeout(() => {
        Object.values(userListeners).forEach(async ({ fn, b, a }: userListenerFunctions) => {
            const before = await b(obj, curReadline)
            if (before === false) {
                return false
            }
            const result = fn(obj, curReadline)
            await a(obj, curReadline)
            return result
        })

        afterKeypress(obj)
        return true
        //      }, 100)
    })
}

export const getInput: FnGetInput = async (modules, pr, initInput = '') => {
    const renewReader = await get('renewReader')
    const utils = await get('terminalUtils')
    const { clearCurrent } = utils

    if (!_getInput) {
        _getInput = makeGetInput()
    }

    if (!curReadline) {
        curReadline = await renewReader(pr, curReadline) // dep: renewReader

    }

    if (!didInitHistory) {
        didInitHistory = true
        const historyListener = await get('historyListener')
        await _getInput
        initHistory(() => {
            clearCurrent(curReadline)
        }, (...args: any[]) => curReadline.write(...args), historyListener, histState, utils)
    }

    const fn = await _getInput
    if (!isNode()) { clearCurrent(curReadline) }
    return fn(modules, pr, initInput)
}

const makeGetInput = async () => {

    if (_getInput) return _getInput

    await loadHist()

    const renewReader = await get('renewReader')

    return async (modules: Modules, pr: string, initialInput: string = ''): Promise<string> => {

        curReadline = await renewReader(pr, curReadline)

        const userInput = await new Promise<string>((res) => {
            fakeCli.modules = modules
            // in browser triggers readlineFunctions > question
            curReadline.question(pr, makeHandleQuestion(res, modules))
            if (initialInput) {
                curReadline.write(initialInput)
                if (curReadline.line !== initialInput) {
                    curReadline.line = initialInput
                }
            }
        })
        return userInput
    }
}
