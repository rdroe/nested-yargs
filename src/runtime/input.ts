import { get, getConfig } from '../shared/index'
import { queue } from '../shared/utils/queue'
import { Readline } from '../shared/utils/types'
import isNode from '../shared/utils/isNode'
import { makeGetLastN, lastFive } from '../shared/utils/makeGetLastN'

const makeHandleQuestion = (res: Function) => {

    return function handleQuestion(rawPreInput: string) {
        let inp: string
        const wrapperFn = getConfig('wrapperFn')
        const rawInput = wrapperFn(rawPreInput)
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


const findKeypressMatch = async (hotkeys: { [keys: string]: Function }): Promise<[string, Function]> => {
    const last2 = getLastN(true, 2)
    const last3 = getLastN(true, 3)

    const ret = Object.entries(hotkeys).find(([key, fn]) => [last2, last3].filter(elem => !!elem).includes(key))
    return ret
}

// lastFive.map(ev => ev.preventDefault())

let curReadline: ReturnType<Readline['createInterface']>
let didInitHistory = false

type FnGetInput = (pr: string, initialInput?: string) => Promise<string>

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

const initHistory = async (clearCurrent: Function, write: Function, historyListener: { on: Function }, hs: { hist: string[], idx: number, line?: string }, utils: { matchUp: Function, matchDown: Function, eventName: string }) => {

    const { matchUp, matchDown, eventName } = utils
    const hotkeys = getConfig('hotkeys')
    const afterKeypress = getConfig('afterKeypress')
    historyListener.on(eventName, async (_: any, obj: any) => {
        if (obj.type && obj.type !== eventName) {
            return
        }
        recordKeypress(obj)
        const matches = await findKeypressMatch(hotkeys)
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
            if (hs.hist[hs.idx] === undefined) return
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

        afterKeypress(obj)

    })
}

export const getInput: FnGetInput = async (pr, initInput = '') => {
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
    return fn(pr, initInput)
}

const makeGetInput = async () => {

    if (_getInput) return _getInput

    await loadHist()

    const renewReader = await get('renewReader')

    return async (pr: string, initialInput: string = ''): Promise<string> => {

        curReadline = await renewReader(pr, curReadline)

        const userInput = await new Promise<string>((res) => {

            // in browser triggers readlineFunctions > question
            curReadline.question(pr, makeHandleQuestion(res))
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
