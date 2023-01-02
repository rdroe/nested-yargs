import { ReadlineInterface } from "./types"
import { cssMonikers } from 'browser/init';
export const NON_NYA_RECIPIENT = 'NON_NYA_RECIPIENT'


// may return NaN
const splitAndNumberize = (ta: string) => {
    const splitted = ta.split('-')
    const last = splitted.pop()
    return parseInt(last, 10)
}
export function isTextArea(elem: HTMLElement): elem is HTMLTextAreaElement {
    if (elem?.tagName === 'TEXTAREA') return true
    return false
}
export function isNyargsArea(elem: any): elem is HTMLTextAreaElement {
    const isNyaTa = elem.id.startsWith(`${cssMonikers.nyargsCli}-`)
    return isTextArea(elem) && isNyaTa
    // return isTextArea(elem) && elem.classList.contains('nya-textarea')
}
export const extractTaId = (ta: string | HTMLElement): number | typeof NON_NYA_RECIPIENT => {

    if (typeof ta !== 'string' && !ta.tagName) {
        console.error(ta)
        throw new Error(`An html element is required for textarea id extraction. problem element is logged above`)
    }

    if (typeof ta === 'string') {
        const asInt = splitAndNumberize(ta)
        return isNaN(asInt) ? NON_NYA_RECIPIENT : asInt
    }

    if (!isNyargsArea(ta)) return NON_NYA_RECIPIENT

    const fullId = (ta as { id: string }).id

    if (!fullId) {
        return NON_NYA_RECIPIENT
    }

    const id = splitAndNumberize(fullId)

    if (isNaN(id)) {
        throw new Error(`Badly formatted textarea id for nyargs text area: ${fullId}`)
    }

    return id
}
type numOrNonNya = number | typeof NON_NYA_RECIPIENT

const lastFiveById: { [Property in numOrNonNya]: KeyboardEvent[] } = {
    0: [],
    [NON_NYA_RECIPIENT]: []
}

export const lastFive = (id: /*number | */typeof NON_NYA_RECIPIENT): KeyboardEvent[] => {

    if (!lastFiveById[id]) {
        lastFiveById[id] = []
    }

    return lastFiveById[id]
}


export const lastFiveReadonly = (id: number): KeyboardEvent[] => {

    if (!lastFiveById[id]) {
        lastFiveById[id] = []
    }

    return lastFiveById[id]
}


export const makeGetLastN = (id: typeof NON_NYA_RECIPIENT) => {
    return makeGetLastN_(id)
}

export const makeGetLastNTest = (id: number) => {
    return makeGetLastN_(id)
}

export const makeGetLastN_ = (id: number | typeof NON_NYA_RECIPIENT) => {

    if (lastFiveById[id] === undefined) {
        lastFiveById[id] = []
    }

    return (n: number) => {
        // needs to be redone as more of a state machine
        // @ts-ignore
        const lastN = lastFive(id).slice(lastFive(id).length - n).reduce((accum: string, ke: KeyboardEvent) => {
            // browser-only above line
            if (ke.type !== 'keyup' && ke.type !== 'keydown') {
                if ((ke as any).sequence === undefined) {
                    return accum
                }
            }

            // browser only has key, not server
            if (typeof ke.key === 'string' || typeof ke.key === 'number') {
                return `${accum}-${ke.key}`
            }
            // ------------------------------------------------------------------(may be broken)
            // Server
            // server has 'sequence' and handles alt, etc, differently
            if (typeof (ke as any).sequence === 'string') {

                const keAsAny = (ke as unknown) as {
                    meta: boolean
                    ctrl: boolean
                    shift: boolean
                    sequence: string
                    name: string
                }
                let ret = accum ?? ''

                const CTRL = keAsAny.ctrl && !ret.includes('-Control') ? '-Control' : ''
                const META = keAsAny.meta && !ret.includes('-Alt') ? '-Alt' : ''
                const SHIFT = keAsAny.shift && !ret.includes('-Shift') ? '-Shift' : ''

                const nm = keAsAny.name && keAsAny.name.length === 1 && keAsAny.shift
                    ? keAsAny.name.toUpperCase()
                    : keAsAny.name

                const totSpecial = (CTRL ? 1 : 0) + (META ? 1 : 0) + (SHIFT ? 1 : 0)


                const pass = `${CTRL}${META}${SHIFT}`
                const prev = ret.split('-').filter(x => !!x)
                prev.push(nm)
                const finalPrev = prev.slice(0 + totSpecial, prev.length)
                let final = `${pass}-${finalPrev.join('-')}`
                return final

            }
        }, '')

        return lastN
    }
}


export type userListenerFunctions = {
    fn: listener
    b: beforeListener
    a: afterListener
}

export const userListeners: {
    [fnName: string]: userListenerFunctions
} = {}

export type beforeListener = (key: KeyboardEvent, curReadline: ReadlineInterface, evRecipient: string) => Promise<boolean>
export type afterListener = (key: KeyboardEvent, curReadline: ReadlineInterface, evRecipient: string) => Promise<void>
export type listener = (key: KeyboardEvent, curReadline: ReadlineInterface, evRecipient: string) => Promise<boolean>

export const addListener = (name: string, fn: listener, b: beforeListener = () => Promise.resolve(true), a: afterListener = () => Promise.resolve()) => {
    if (userListeners[name]) throw new Error(`Function name ${name} is already set as a listener. Please delete it from userListeners, or choose a different name.`)
    userListeners[name] = {
        fn,
        b, a
    }
}

export let keypressFinished: Promise<void> = Promise.resolve()

export function recordKeypress(keyboardEvent: KeyboardEvent, taId: number | typeof NON_NYA_RECIPIENT): void {

    lastFive(NON_NYA_RECIPIENT).push(keyboardEvent)
    if (lastFive(NON_NYA_RECIPIENT).length === 6) {
        lastFive(NON_NYA_RECIPIENT).shift()
    }

    if (typeof taId === 'number') {
        lastFiveReadonly(taId).push(keyboardEvent)
        if (lastFiveReadonly(taId).length === 6) {
            lastFiveReadonly(taId).shift()
        }
        const last2 = makeGetLastNTest(taId)(2)
        console.log('last 2 in that ta', last2)

    }




}

