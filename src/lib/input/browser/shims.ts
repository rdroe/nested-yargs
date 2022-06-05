import { Result } from '../../../appTypes';
import { ReadlineInterface, RenewReader, HistoryListener, setDeps } from '../../dynamic'
import { db, Dexie } from './db'

const DO_AUTO_SCROLL = true
const textAreas: HTMLTextAreaElement[] = []
const latestTextArea = () => textAreas.length ? textAreas[textAreas.length - 1] : null
const prompts = new Map<HTMLTextAreaElement, string>()

const lastFive: KeyboardEvent[] = []
const callables = new Map<HTMLTextAreaElement, Function>()
const submitters = new Map<HTMLTextAreaElement, Function>()
const printAreas = new Map<HTMLTextAreaElement, HTMLElement>()
const whitelistedTypes = ['keydown']

const allMaps: Map<string, Map<HTMLTextAreaElement, any>> = new Map

const mapCallable = (textArea: HTMLTextAreaElement, fn: Function) => {
    callables.set(textArea, fn)
}
const getCallable = (textArea: HTMLTextAreaElement): Function => {
    return callables.get(textArea)
}

const mapPrompt = (textArea: HTMLTextAreaElement, pr: string) => {
    prompts.set(textArea, pr)
}

const getPrompt = (textArea: HTMLTextAreaElement): string => {
    return prompts.get(textArea)
}

const mapSubmitter = (textArea: HTMLTextAreaElement, fn: Function) => {
    submitters.set(textArea, fn)
}

const getSubmitter = (textArea: HTMLTextAreaElement): Function => {
    return submitters.get(textArea)
}

const mapPrintArea = (textArea: HTMLTextAreaElement, elem: HTMLElement) => {
    printAreas.set(textArea, elem)
}


const getPrintArea = (textArea: HTMLTextAreaElement): HTMLElement => {
    return printAreas.get(textArea)
}

const maps = {
    init: <MapValuesType = any>(name: string) => {
        allMaps.set(name, new Map<HTMLTextAreaElement, MapValuesType>())
    },
    sett: <V>(mapName: string, key: HTMLTextAreaElement, value: V) => {
        const map1 = allMaps.get(mapName)
        if (!map1) return
        map1.set(key, value)
    },
    get: (mapName: string, key: HTMLTextAreaElement) => {
        const map1 = allMaps.get(mapName)
        if (!map1) return
        return map1.get(key)
    }
}

maps.init<boolean>('toggled')

const taParent = (elem: HTMLElement) => {
    return elem.parentElement
}

const displayPrompt = (textArea: HTMLTextAreaElement) => {
    const prompt = getPrompt(textArea)
    const label = textArea.parentElement?.querySelector('.prompt-text')
    if (!label) throw new Error(`Can't find .prompt-text for the specificed <textarea>`)
    label.innerHTML = `<span>${prompt}</span>`
}

const textAreaUtils = (textArea: HTMLTextAreaElement = latestTextArea()) => {
    return {
        get line(): string {
            return textArea.value
        },
        matchUp: (obj: any) => {
            return obj.key === 'ArrowUp'
        },
        matchDown: (obj: any) => {
            return obj.key === 'ArrowDown'
        },
        eventName: 'keydown',
        clearCurrent: () => {
            textArea.value = ''
        },
    }
}

const readlineFunctions = (ta: HTMLTextAreaElement): ReadlineInterface => {
    const utils = textAreaUtils(ta)
    return {
        write: (arg: string) => ta.value = `${ta.value}${arg}`,
        close: () => { },
        get line() { return utils.line },
        question: (pr: string, fn: Function) => {

            mapPrompt(ta, pr)
            displayPrompt(ta)
            document.removeEventListener('keydown', handleKeypress, true)
            return new Promise((resolve) => {
                mapSubmitter(ta, async (arg: string) => {
                    document.removeEventListener('keydown', handleKeypress, true)
                    const res = await fn(arg)
                    return resolve(res)
                })
                document.addEventListener('keydown', handleKeypress, true)
            })
        }
    }
}

const getOrInitPrintArea = (ta: HTMLTextAreaElement) => {

    let printArea = getPrintArea(ta)
    if (!printArea) {
        const num = textAreas.indexOf(ta)
        if (num === -1) throw new Error('Error; could not find cached text area to match that one')
        const added = addElem('div', {
            class: `print-area print-area-${num}`,
            style: 'margin: 0; padding: 0;'
        })

        const text = addElem('pre', {
            class: `print-area-text print-area-text-${num}`,
        }, {
            parent: added
        })

        mapPrintArea(ta, text)
        printArea = getPrintArea(ta)
        // if printArea shares a parent with its textarea, re-added textarea to put it on top
        if (ta?.parentElement?.parentElement === added.parentElement) {
            added.parentElement.appendChild(ta.parentElement)
            ta.focus()
        }
    }

    if (!printArea) {
        throw new Error('Could not find or create print area')
    }
    return printArea
}

const print = (arg: string | number | object, ta: HTMLTextAreaElement = latestTextArea()) => {
    const printArea = getOrInitPrintArea(ta)
    const text = typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
    printArea.innerHTML = `${printArea.innerHTML}
${text}
`

    if (DO_AUTO_SCROLL) {
        const printAreaContainer = getPrintArea(ta)
        const scrollable = printAreaContainer?.parentElement
        if (scrollable) {
            scrollable.scroll({ top: printAreaContainer.getBoundingClientRect().height })
        }
    }
}

const printResult = async (result: Result): Promise<boolean> => {
    if (result.argv.help === true) {
        return false
    }
    print('')
    if (!result.isMultiResult) {
        print(result)
        return true
    } else {
        let didPrint = false
        Object.entries(result.list).forEach(async ([idx, res]) => {
            didPrint = true
            print(`${idx} result:`)
            print(res)
            if (result.argv[idx].logArgs === true) {
                print(`${idx} computed arguments:`)
                print(result.argv[idx])
                print('all args:')
                print(result)
            }
        })
        if (DO_AUTO_SCROLL) {
            window.scroll({ top: document.body.getBoundingClientRect().height })
        }
        return didPrint
    }
}


const getLastN = (elem: HTMLElement | true, n: number) => {
    let first: EventTarget
    const lastTwo = lastFive.slice(lastFive.length - n).reduce((accum: string, ke: KeyboardEvent) => {
        // all events must be from the most recent recipient
        first = first ?? ke.target
        if (ke.type !== 'keydown') {
            return accum
        }

        if (elem !== true) {
            if (elem !== ke.target) return accum
        }

        return `${accum}-${ke.key}`
    }, '')

    return lastTwo
}

const getLastTwo = (ta: HTMLTextAreaElement) => getLastN(ta, 2)

interface BaseAttribs {
    style?: string
    'class'?: string
    id?: string
}

interface BaseOptions {
    parent: HTMLElement
}

const addElem = <
    Attribs extends BaseAttribs = BaseAttribs,
    Opts extends BaseOptions = BaseOptions
>(tag: string, attribs: Attribs, opts: Opts | null = null): HTMLElement => {

    const options = opts ? opts : { parent: document.body }
    const elem = document.createElement(tag)
    Object.entries(attribs).forEach(([key, val]) => {
        elem.setAttribute(key, val)
    })

    const parentElem = options.parent

    if (!parentElem || !parentElem.appendChild) {
        throw new Error(`Supposed parent element (${parentElem}) has no "appendChild" method`)
    }

    parentElem.appendChild(elem)
    return elem
}

function isNyargsArea(elem: any): elem is HTMLTextAreaElement {

    return isTextArea(elem) && elem.classList.contains('ny-text-area')
}

function isTextArea(elem: HTMLElement): elem is HTMLTextAreaElement {
    if (elem.tagName === 'TEXTAREA') return true
    return false
}

const makeTextArea = (): HTMLTextAreaElement => {
    const taLen = textAreas.length
    const parent = addElem('div', {
        style: 'overflow: visible;',
        class: `text-area-container text-area-container-${taLen}`,
        id: `text-area-container-${taLen}`
    })

    addElem('div', {
        'class': `prompt-text promp-text-${taLen}`,
        'style': 'position: absolute; right: 100%; width: 100%; top: 0; display: flex; justify-content: end;'
    }, {
        parent
    })

    const ta = addElem('textarea', {
        id: `textarea-${taLen}`,
        class: `prompt-text promp-text-${taLen} ny-text-area`,
        style: 'height: 100%; width: 100%;',
        autofocus: true
    }, {
        parent
    })

    if (!isTextArea(ta)) {
        throw new Error(`Cannot return non-textarea`)
    }
    maps.sett('toggled', ta, true)
    return ta

}

export const historyListener: HistoryListener = {
    on: (evName: string, fn: (_: any, kbe: KeyboardEvent) => boolean) => {
        if (whitelistedTypes.includes(evName) === false) {
            throw new Error('historyListener is only made for "keydown" kind of node readline spoofing.')
        }
        const latestTerminal = latestTextArea()
        mapCallable(latestTerminal, fn)

    }
}

export const terminalUtils = {
    matchUp: (obj: KeyboardEvent) => textAreaUtils().matchUp(obj),
    matchDown: (obj: KeyboardEvent) => textAreaUtils().matchDown(obj),
    eventName: 'keydown',
    clearCurrent: () => { textAreaUtils().clearCurrent() }
}

export const renewReader: RenewReader = async (pr: string): Promise<ReadlineInterface> => {
    let latestTerminal = latestTextArea()
    if (latestTerminal === null) {
        textAreas.push(makeTextArea())
        latestTerminal = latestTextArea()
    }
    if (latestTerminal === null) throw new Error('Could not find or create a textarea-based terminal')

    return readlineFunctions(latestTerminal)
}

export const fs = {
    writeFileSync: (fname: string, dat: string, encoding: 'utf8' = 'utf8') => {
        const encodingMap = {
            'utf8': 'utf-8'
        }

        if (!encodingMap[encoding]) {
            throw new Error(`only utf8 encoding is allowed right now.`)
        }

        var dataStr = `data:text/json;charset=${encodingMap[encoding]},${dat.replace('\n', '\r\n')}`
        const dlAnchorElem = document.createElement('a')
        document.body.appendChild(dlAnchorElem)
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", fname);
        dlAnchorElem.click();
        dlAnchorElem.remove();
    },
    readFileSync: () => { }
}

export const readline = {
    createInterface: () => ({
        question: () => { },
        write: () => { },
        close: () => { },
        line: ''
    })
}

function recordKeypress(keyboardEvent: KeyboardEvent): void {
    lastFive.push(keyboardEvent)
    if (lastFive.length === 6) {
        lastFive.shift()
    }
}

function handleKeypress(ke: KeyboardEvent) {
    recordKeypress(ke)
    handleTextKeypress(ke)
    handleAnyKeypress(ke)(true, () => {
        const lastFour = getLastN(true, 4)
        if (lastFour.startsWith('-Control-Shift-:-')) {
            lastFive.map(ev => ev.preventDefault())
            const keypress = lastFour.split('-Control-Shift-:-')[1]
            const sel = `.ny-text-area#textarea-${keypress}`
            const ta = document.querySelector(sel)

            if (isNyargsArea(ta)) {
                const isOn = toggleTa(ta)
                if (isOn) {
                    ta.focus()
                } else {
                    ta.blur()
                }
            } else {
                throw new Error('naming clash; only text areas should have "ny-text-area" class')
            }



        }
    })
}

function handleAnyKeypress(ke: KeyboardEvent) {
    return (elem: Window | HTMLElement | true, fn: Function) => {

        if (elem === true || ke.target === elem) {
            fn()
        }
    }
}

function toggleTa(ta: HTMLTextAreaElement): boolean {
    const toggled = maps.get('toggled', ta)
    const pa = taParent(ta)
    const printArea = getPrintArea(ta)
    const newTog = !toggled

    if (newTog) {
        pa.classList.remove('is-offscreen')
        if (printArea?.parentElement) printArea.parentElement.classList.remove('is-offscreen')
    } else {
        pa.classList.add('is-offscreen')
        if (printArea?.parentElement) printArea.parentElement.classList.add('is-offscreen')
    }
    maps.sett('toggled', ta, newTog)
    return newTog
}

function handleTextKeypress(ke: KeyboardEvent) {

    if (document.activeElement !== ke.target) {
        return
    }
    if (!isNyargsArea(ke.target)) {
        return
    }
    const histFunc = getCallable(ke.target as HTMLTextAreaElement)

    // call specific handler for kepyresses for this (focused) element
    if (histFunc) {
        histFunc(null, ke)
    }

    const ta = ke.target

    const last2 = getLastTwo(ta)
    const last3 = getLastN(ta, 3)

    if (last2 === '-Control-Enter') {
        const resolver = getSubmitter(ta)
        ke.stopPropagation()
        return resolver(ta.value)
    } else if (last3 === '-Control-Shift-K' || last3 === '-Shift-Control-K') {
        toggleTa(ta)

        ke.stopPropagation()
    }
}


setDeps({
    fs,
    readline,
    shelljs: { mkdir: (...args: any[]) => { } },
    printResult,
    renewReader,
    terminalUtils,
    historyListener,
    db: db,
    Dexie
})


