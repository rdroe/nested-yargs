import { ReadlineInterface, HistoryListener, RenewReader, Result, BaseArguments } from '../../shared/utils/types';

import { makeGetLastN, lastFive } from '../../shared/utils/makeGetLastN';
import { getText } from '../../shared/utils/printResult';

const DO_AUTO_SCROLL = true
const textAreas: HTMLTextAreaElement[] = []
const latestTextArea = () => textAreas.length ? textAreas[textAreas.length - 1] : null
const prompts = new Map<HTMLTextAreaElement, string>()

const getLastN = makeGetLastN()
const callables = new Map<HTMLTextAreaElement, Function>()
const submitters = new Map<HTMLTextAreaElement, Function>()
const printAreas = new Map<HTMLTextAreaElement, HTMLElement>()
const whitelistedTypes = ['keyup', 'keydown']

const allMaps: Map<string, Map<HTMLTextAreaElement, any>> = new Map

const mapCallable = (textArea: HTMLTextAreaElement, fn: (...args: any[]) => boolean) => {
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

// make configurable 
const taParent = (elem: HTMLElement) => {
    return elem.parentElement
}

const displayPrompt = (textArea: HTMLTextAreaElement) => {
    const prompt = getPrompt(textArea)
    const label = textArea.parentElement?.querySelector('.prompt-text')
    if (!label) throw new Error(`Can't find .prompt-text for the specificed <textarea>`)
    label.innerHTML = `<span>${prompt}</span>`
}

const textAreaUtils = () => {
    return {
        get line(): string {
            return latestTextArea().value
        },
        matchUp: (obj: any) => {
            return obj.key === 'ArrowUp'
        },
        matchDown: (obj: any) => {
            return obj.key === 'ArrowDown'
        },
        eventName: 'keyup',
        clearCurrent: () => {
            latestTextArea().value = ''
        },
    }
}

const readlineFunctions = (ta: HTMLTextAreaElement): ReadlineInterface => {
    const utils = textAreaUtils()
    return {
        write: (arg: string) => {
            ta.value = `${ta.value}${arg}`
        },
        close: () => { },
        get line() { return utils.line },
        question: (pr: string, fn: Function) => {

            mapPrompt(ta, pr)
            displayPrompt(ta)
            document.removeEventListener('keyup', handleKeypress, true)
            document.removeEventListener('keydown', handleKeypress, true)
            return new Promise((resolve) => {

                mapSubmitter(ta, (arg: string) => {
                    document.removeEventListener('keyup', handleKeypress, true)
                    document.removeEventListener('keydown', handleKeypress, true)
                    const res = fn(arg)
                    return resolve(res)
                })
                document.addEventListener('keyup', handleKeypress, true)
                document.addEventListener('keydown', handleKeypress, true)
            })
        }
    }
}

// make configurable
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

export const print = <T extends BaseArguments = BaseArguments>(argv: T, arg: Result, ta: HTMLTextAreaElement = latestTextArea()): Promise<boolean> => {
    const printArea = getOrInitPrintArea(ta)
    const text = getText(argv, arg)

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
    return Promise.resolve(true)
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

// make configurable
function isNyargsArea(elem: any): elem is HTMLTextAreaElement {
    return isTextArea(elem) && elem.classList.contains('ny-text-area')
}

function isTextArea(elem: HTMLElement): elem is HTMLTextAreaElement {
    if (elem?.tagName === 'TEXTAREA') return true
    return false
}

// make configurable
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
            throw new Error('historyListener is only made for "keyup" kind of node readline spoofing.')
        }
        const latestTerminal = latestTextArea()
        mapCallable(latestTerminal, fn)
        return true
    }
}

export const terminalUtils = {
    matchUp: (obj: KeyboardEvent) => textAreaUtils().matchUp(obj),
    matchDown: (obj: KeyboardEvent) => textAreaUtils().matchDown(obj),
    eventName: 'keyup',
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


function handleKeypress(ke: KeyboardEvent) {
    handleTextKeypress(ke)

    handleAnyKeypress(ke)(true, async () => {

        const lastFour = getLastN(true, 4)

        if (lastFour.startsWith('-Control-Shift-;-')) {
            lastFive.map(ev => ev.preventDefault())
            const keypress = lastFour.split('-Control-Shift-;-')[1]
            const sel = `.ny-text-area#textarea-${keypress}`
            const ta = document.querySelector(sel)

            if (ta && isNyargsArea(ta)) {
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

// make configurable
export function toggleTa(ta: HTMLTextAreaElement): boolean {
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

function handleTextKeypress(ke: KeyboardEvent): Promise<void> {
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

    if (['-Control-Enter', '-Enter-Control'].includes(last2)) {
        const resolver = getSubmitter(ta)
        ke.stopPropagation()
        return resolver(ta.value)
    }

}

