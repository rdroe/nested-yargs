import { Result } from '../../../appTypes';
import { ReadlineInterface, RenewReader, HistoryListener, setDeps } from '../../dynamic'
import { db, Dexie } from './db'

const DO_AUTO_SCROLL = true
const textAreas: HTMLTextAreaElement[] = []
const latestTextArea = () => textAreas.length ? textAreas[textAreas.length - 1] : null
const prompts = new Map<HTMLTextAreaElement, string>()

const state = new Map<HTMLTextAreaElement, { lastFive: KeyboardEvent[] }>()
const callables = new Map<HTMLTextAreaElement, Function>()
const submitters = new Map<HTMLTextAreaElement, Function>()
const printAreas = new Map<HTMLTextAreaElement, HTMLElement>()
const whitelistedTypes = ['keydown']

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
            ta.removeEventListener('keydown', submitCurrentInput)
            return new Promise((resolve) => {
                mapSubmitter(ta, (arg: string) => {
                    ta.removeEventListener('keydown', submitCurrentInput)
                    resolve(fn(arg))
                })
                ta.addEventListener('keydown', submitCurrentInput)

            })
        }
    }
}

const getOrInitPrintArea = (ta: HTMLTextAreaElement) => {

    let printArea = getPrintArea(ta)
    if (!printArea) {
        mapPrintArea(ta, addElem('pre', {
            class: `print-area print-area-${textAreas.length}`,
            style: 'width: 50vw; height: 100%; margin: 0; padding: 0;'
        }))
        printArea = getPrintArea(ta)
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
}

const printResult = async (result: Result): Promise<boolean> => {
    if (result.argv.help === true) {
        return false
    }
    print('')
    if (!result.isMultiResult) {
        print(result)
        if (DO_AUTO_SCROLL) {
            window.scroll({ top: document.body.getBoundingClientRect().height })
        }
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

const getLastTwo = (ta: HTMLTextAreaElement) => {
    const { lastFive } = state.get(ta)
    const lastTwo = lastFive.slice(lastFive.length - 2).reduce((accum: string, ke: KeyboardEvent) => {
        if (ke.type !== 'keydown') {
            return accum
        }

        return `${accum}-${ke.key}`
    }, '')

    return lastTwo
}

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

function isTextArea(elem: HTMLElement): elem is HTMLTextAreaElement {
    if (elem.tagName === 'TEXTAREA') return true
    return false
}

const makeTextArea = (): HTMLTextAreaElement => {
    const taLen = textAreas.length
    const parent = addElem('div', {
        style: 'width: 35%; height: 10%; position: fixed; right: 0; bottom: 0; overflow: visible;',
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
        class: `prompt-text promp-text-${taLen}`,
        style: 'height: 100%; width: 100%;'
    }, {
        parent
    })

    if (!isTextArea(ta)) {
        throw new Error(`Cannot return non-textarea`)
    }

    return ta

}

export const historyListener: HistoryListener = {
    on: (evName: string, fn: (_: any, kbe: KeyboardEvent) => boolean) => {
        if (whitelistedTypes.includes(evName) === false) {
            throw new Error('historyListener is only made for "keydown" kind of node readline spoofing.')
        }
        const latestTerminal = latestTextArea()
        mapCallable(latestTerminal, fn)
        latestTerminal.removeEventListener('keydown', nyargsHandler)
        latestTerminal.addEventListener('keydown', nyargsHandler)
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
        state.set(latestTerminal, { lastFive: [] })
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

function submitCurrentInput(ke: KeyboardEvent) {
    const ta = ke.target as HTMLTextAreaElement
    const last2 = getLastTwo(ta)
    if (last2 === '-Control-Enter') {
        const resolver = getSubmitter(ta)
        return resolver(ta.value)
    }
}

function nyargsHandler(keyboardEvent: KeyboardEvent): void {
    const currState = state.get(keyboardEvent.target as HTMLTextAreaElement)
    const { lastFive } = currState
    lastFive.push(keyboardEvent)
    if (lastFive.length === 6) {
        lastFive.shift()
    }
    const histFunc = getCallable(keyboardEvent.target as HTMLTextAreaElement)
    return histFunc(null, keyboardEvent)
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


