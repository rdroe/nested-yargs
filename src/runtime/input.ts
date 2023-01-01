import { get, getConfig } from '../shared/index'
import { queue } from '../shared/utils/queue'
import { Readline, Modules, Module, HistoryListener } from '../shared/utils/types'
import isNode from '../shared/utils/isNode'
import { makeGetLastN, lastFive, userListeners, userListenerFunctions, extractTaId, extractTaIdFromId } from '../shared/utils/makeGetLastN'
import { caller } from './setUp'
import { RESULT_KEY } from '../shared/utils/const'
import stringArgv from 'string-argv'
const virtualRecipient = 'nya-textarea-0'

export { userListeners, addListener } from '../shared/utils/makeGetLastN'
export const fakeCli: {
    modules: Modules | null
    handle: (str: string) => Promise<{ argv: object, [RESULT_KEY]: object }>,
    getCommandCounter: (modules?: Modules | null) => (str: string) => number,
    getMatchingModules: (modules?: Modules | null) => (str: string) => Module[],
} = {
    modules: null,
    handle: async (str: string) => {
        const fn = await caller.get
        const answer = await fn(fakeCli.modules, str)
        return answer
    },
    getCommandCounter: (moduleObj: Modules | null = fakeCli.modules) => (str: string) => {
        if (!moduleObj) return 0
        const asArgs = stringArgv(str)
        let cnt = 0
        let curs: string | number | undefined = asArgs.shift()
        let currSubmodules = moduleObj
        while (curs && currSubmodules[curs]) {
            cnt += 1
            currSubmodules = currSubmodules[curs]?.submodules ?? {}
            curs = asArgs.shift()
        }
        return cnt
    },
    getMatchingModules: (moduleObj: Modules | null = fakeCli.modules) => (str: string): Module[] => {
        if (!moduleObj) return []
        const asArgs = stringArgv(str)
        let modulesAndSubmodules: Module[] = []
        let curs: string | number | undefined = asArgs.shift()
        let currSubmodules = moduleObj
        while (curs && currSubmodules[curs]) {
            const foundModule = currSubmodules[curs] ?? null
            if (foundModule) {
                modulesAndSubmodules.push(foundModule)
            }
            currSubmodules = foundModule && foundModule.submodules ? foundModule.submodules : {}
            curs = asArgs.shift()
        }
        return modulesAndSubmodules
    }
}

const makeHandleQuestion = (res: Function, modules: Modules, id: number = 0) => {

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

        curReadline(0).close() // note: no-op in browser

        // histState.idx = histState.hist.length

        histIdx(histState.hist.length)

        return res(inp)
    }
}



function recordKeypress(keyboardEvent: KeyboardEvent, taId = 0): void {

    lastFive(taId).push(keyboardEvent)

    if (lastFive(taId).length === 6) {
        lastFive(taId).shift()
    }
}


const findKeypressMatch = (hotkeys: { [keys: string]: Function }): [string, Function] => {


    const last2 = makeGetLastN(0)(2)
    const last3 = makeGetLastN(0)(3)
    const ret = Object.entries(hotkeys).find(([key, fn]) => [last2, last3].filter(elem => !!elem).includes(key))

    return ret
}

// lastFive.map(ev => ev.preventDefault())
const curReadlines: { [id: number]: ReturnType<Readline['createInterface']> } = {}

export let curReadline = (num: number) => {
    return curReadlines[num]
}

const inittedHists: number[] = []

let didInitHistory = (num: number) => {
    return inittedHists.includes(num)
}

type FnGetInput = (modules: Modules, pr: string, id: number, initialInput?: string) => Promise<string>

const inputProms: { [id: number]: Promise<FnGetInput> } = {}
let _getInput = (num: number): Promise<FnGetInput> => {
    return inputProms[num]

}


const histState: {
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
let didLoad = false
const loadHist = async () => {
    if (didLoad) return
    const lhFn = await get('loadHistory')
    const data = await lhFn()
    Object.assign(histState, data)
    didLoad = true
}

const histIdx = (idx: number) => {
    histState.idx = idx

}


const initHistory = async (
    clearCurrent: Function,
    write: Function,
    historyListener: HistoryListener,
    hs: { hist: string[], idx: number, line?: string },
    utils: {
        matchUp: Function,
        matchDown: Function,
        eventName: string
    },
    id: number) => {

    const { matchUp, matchDown, eventName } = utils
    const hotkeys = getConfig('hotkeys')
    const afterKeypress = getConfig('afterKeypress')

    historyListener.on(eventName, id, (_: any, obj: KeyboardEvent) => {

        let evRecipient: string
        if (obj.target) {
            if ((obj.target as any)?.id !== undefined) {
                evRecipient = (obj.target as any).id
            }
        }

        if (evRecipient === undefined) {
            evRecipient = virtualRecipient
        }

        const deducedId = extractTaIdFromId(evRecipient)

        if (isNaN(id) || id < 0) throw new Error(`Error; bad recipient id for key event: ${evRecipient}`)
        if (id !== deducedId) {
            return
        }

        if (obj.type && obj.type === 'keydown') {
            recordKeypress(obj, id)
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
            clearCurrent(curReadline(id))
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
            clearCurrent(curReadline(id))
            write(hs.hist[hs.idx] ?? '')
        } else if (matches && matches[1]) {
            matches[1](curReadline(id).line)
        }

        setTimeout(() => {

            Object.values(userListeners).forEach(async ({ fn, b, a }: userListenerFunctions) => {

                const before = await b(obj, curReadline(id), evRecipient)
                if (before === false) {
                    return false
                }
                const result = fn(obj, curReadline(id), evRecipient)
                await a(obj, curReadline(id), evRecipient)
                return result
            })

            afterKeypress(obj)
            return true

        }, 20)
    })
}

export const getInput: FnGetInput = async (modules, pr, id: number, initInput: string = '') => {

    const renewReader = await get('renewReader')
    const utils = await get('terminalUtils')
    const { clearCurrent } = utils

    if (!_getInput(id)) {
        inputProms[id] = makeGetInput(id)
    }


    if (!curReadline(id)) {
        curReadlines[id] = await renewReader(pr, id) // dep: renewReader
    }

    if (!didInitHistory(id)) {
        inittedHists.push(id)
        const historyListener = await get('historyListener')
        await _getInput(id)

        initHistory(() => {
            clearCurrent(curReadline(id))
        }, (...args: any[]) => curReadline(id).write(...args), historyListener, histState, utils, id)
    }

    const fn = await _getInput(id)
    if (!isNode()) { clearCurrent(curReadline(id)) }
    return fn(modules, pr, id, initInput)
}

const makeGetInput = async (id: number = 0) => {

    if (_getInput(id)) return _getInput(id)

    await loadHist()

    const renewReader = await get('renewReader')

    return async (modules: Modules, pr: string, id: number, initialInput: string = ''): Promise<string> => {

        curReadlines[id] = await renewReader(pr, id)

        const userInput = await new Promise<string>((res) => {
            fakeCli.modules = modules
            // in browser triggers readlineFunctions > question
            curReadline(id).question(pr, makeHandleQuestion(res, modules, id))
            if (initialInput) {
                curReadline(id).write(initialInput)
                if (curReadline(id).line !== initialInput) {
                    curReadline(id).line = initialInput
                }
            }
        })
        return userInput
    }
}
