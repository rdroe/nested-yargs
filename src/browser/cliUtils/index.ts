import { ReadlineInterface, HistoryListener, RenewReader, Result, BaseArguments } from '../../shared/utils/types';
import { makeGetLastN, lastFive, extractTaId, isTextArea, isNyargsArea, NON_NYA_RECIPIENT, recordKeypress } from '../../shared/utils/makeGetLastN';
import { getText } from '../../shared/utils/printResult';
import { isNumber } from 'shared/utils/validation';
import { cssMonikers, classesByName, idsByName } from 'browser/init';

const DO_AUTO_SCROLL = true
const textAreas: HTMLTextAreaElement[] = []
const latestTextArea = (id: number = 0) => textAreas[id] ? textAreas[id] : null
const prompts = new Map<HTMLTextAreaElement, string>()
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





export const getClassString = (id: number, str: keyof ReturnType<typeof classesByName>) => {
    return classesByName(id)[str].join(' ')

}

export const getCssId = (id: number, str: keyof ReturnType<typeof idsByName>) => {
    return idsByName(id)[str]
}

const idSel = (str: string) => `#${str}`
const classesSel = (str: string) => `.${str.replace(/\s/g, '.')}`



//end styles

// make configurable 
const taParent = (elem: HTMLElement) => {
    return elem.parentElement
}

const displayPrompt = (textArea: HTMLTextAreaElement) => {
    // get updated prompt string
    const prompt = getPrompt(textArea)
    // get the container to update with freshest text
    const taId = extractTaId(textArea)
    if (typeof taId !== 'number') throw new Error('Number is required')
    const labelSel = classesSel(getClassString(taId, 'promptText'))

    const label = document.querySelector(labelSel)

    if (!label) throw new Error(`Can't find prompText for the specificed <${cssMonikers.nyargsCli}>`)
    label.innerHTML = `<span>${prompt}</span>`
}

const textAreaUtils = (id: number = 0) => {
    return {
        get line(): string {
            return latestTextArea(id).value
        },
        set line(val: string) {
            latestTextArea(id).value = val
        },
        matchUp: (obj: any) => {
            return obj.key === 'ArrowUp'
        },
        matchDown: (obj: any) => {
            return obj.key === 'ArrowDown'
        },
        eventName: 'keyup',
        clearCurrent: () => {
            latestTextArea(id).value = ''
        },
    }
}

type RecordKeypressParams = Parameters<typeof recordKeypress>
const recordKeypressCopy: typeof recordKeypress = (obj: RecordKeypressParams[0], id: RecordKeypressParams[1]) => {
    if (obj.type !== 'keydown') {
        return
    }
    if (id === NON_NYA_RECIPIENT) {

        recordKeypress(obj, id)
    } else {
        throw new Error(`Would have double recorded an event for ${obj.target?.toString()}`)
    }
}

const recordKeypressProxy: (ev: KeyboardEvent) => ReturnType<typeof recordKeypress> = (ev: KeyboardEvent) => {
    if (ev.target && !isNyargsArea(ev.target)) {
        const id = extractTaId(ev.target as HTMLElement)
        recordKeypressCopy(ev, id)
    }
}
const readlineFunctions = (ta: HTMLTextAreaElement, id: number): ReadlineInterface => {

    const utils = textAreaUtils(id)
    return {
        write: (arg: string) => {
            ta.value = `${ta.value}${arg}`
        },
        close: () => { },
        get line() { return utils.line },
        set line(val: string) {
            ta.value = val
        },
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
            class: getClassString(num, 'printArea'),

        })

        const text = addElem('pre', {
            class: getClassString(num, 'printAreaText'),
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


const getLastTwo = (ta: HTMLTextAreaElement) => {
    //    const id = extractTaId(ta)
    return makeGetLastN(NON_NYA_RECIPIENT)(2)

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





// make configurable
const makeTextArea = (id: number): HTMLTextAreaElement => {

    const parent = addElem('div', {
        class: getClassString(id, 'textareaContainer'),
        id: getCssId(id, 'textareaContainer')
    })

    addElem('div', {
        'class': getClassString(id, 'promptText'),

    }, {
        parent
    })

    const idName = getCssId(id, 'textarea')
    const classStr = getClassString(id, 'textarea')
    const ta = addElem('textarea', {
        id: idName,
        class: classStr,
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
    on: (evName: string, id: number, fn: (_: any, kbe: KeyboardEvent) => boolean) => {

        if (whitelistedTypes.includes(evName) === false) {
            throw new Error('historyListener is only made for "keyup" kind of node readline spoofing.')
        }
        const latestTerminal = latestTextArea(id)

        mapCallable(latestTerminal, fn)
        return true
    }
}

export const terminalUtils = {
    matchUp: (obj: KeyboardEvent) => textAreaUtils().matchUp(obj),
    matchDown: (obj: KeyboardEvent) => textAreaUtils().matchDown(obj),
    eventName: 'keyup',
    clearCurrent: (curReadline: ReadlineInterface) => {
        curReadline.line = ''
    }
}

export const renewReader: RenewReader = async (pr: string, id: number): Promise<ReadlineInterface> => {
    const readerTaId = idSel(getCssId(id, 'textarea'))

    let rawTa = document.querySelector(readerTaId)
    if (!rawTa) {
        console.log('making textarea id', id)
        rawTa = makeTextArea(id)
    }
    if (!rawTa) throw new Error(`Could not create a terminal for ${id}`)
    let latestTerminal = latestTextArea(id)

    if (latestTerminal === null) {
        textAreas.push(rawTa as HTMLTextAreaElement)
        latestTerminal = latestTextArea(id)
    }

    if (latestTerminal === null) throw new Error(`Could not find a terminal ${id}`)

    mapPrompt(latestTerminal, pr)
    if (latestTerminal === null) throw new Error('Could not find or create a textarea-based terminal')

    return readlineFunctions(latestTerminal, id)
}


function handleKeypress(ke: KeyboardEvent) {

    //    const id = extractTaId(ke.target as HTMLTextAreaElement)
    handleTextKeypress(ke)

    handleAnyKeypress(ke)(true, async () => {
        ke.stopPropagation()
        const lastFour = makeGetLastN(NON_NYA_RECIPIENT)(4)

        if (lastFour.startsWith('-Control-Shift-:-') && ke.type === 'keydown') {
            lastFive(NON_NYA_RECIPIENT).map(ev => { ev.preventDefault(); ev.stopPropagation() })

            const keypress = lastFour.split('-Control-Shift-:-')[1]
            if (!isNumber(keypress)) {
                throw new Error(`For -Control-Shift-:-[some key] hotkey, [some key] must be a number; received: ${lastFour}`)
            }
            const num = parseInt(keypress)
            const cStr = getClassString(num, 'textarea')
            const cSel = classesSel(cStr)
            const ta = document.querySelector(cSel)
            const isNyargs = isNyargsArea(ta)
            if (ta && isNyargs) {
                const isOn = toggleTa(ta)
                if (isOn) {
                    ta.focus()
                } else {
                    ta.blur()
                }
            } else {
                throw new Error('naming clash; only text areas should have "nya-textarea" class')
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
    const taId = extractTaId(ta)
    console.log('toggling! ta is ', taId)
    const toggled = maps.get('toggled', ta)
    const pa = taParent(ta)
    const printArea = getPrintArea(ta)
    const newTog = !toggled

    if (newTog) {
        pa.classList.remove(cssMonikers.isOffscreen)
        if (printArea?.parentElement) printArea.parentElement.classList.remove(cssMonikers.isOffscreen)
    } else {
        pa.classList.add(cssMonikers.isOffscreen)
        if (printArea?.parentElement) printArea.parentElement.classList.add(cssMonikers.isOffscreen)
    }
    maps.sett('toggled', ta, newTog)
    return newTog
}

function handleTextKeypress(ke: KeyboardEvent): Promise<void> {
    if (document.activeElement !== ke.target) {
        console.error('at some point, you were returning out on this match')
    }
    const isNy = isNyargsArea(ke.target)

    if (!isNy) {
        // this keypress recording is handled universally, over in runtime/input--except for this one case. 
        // in the browser only, you might be inputting into a non-nyargs textarea. the document should capture these as some hotkeys (perhaps most) are not focused only on one cli text area
        // recordKeypress note
        // longer term, this should also be simulated in Node; allow node to configure global versus focused hotkey recording.
        recordKeypress(ke, extractTaId(ke.target as HTMLElement))
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

