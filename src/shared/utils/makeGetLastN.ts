import { ReadlineInterface } from "./types"

const lastFiveById: { [id: number]: KeyboardEvent[] } = {
    0: []
}

export const lastFive = (id: number = 0): KeyboardEvent[] => {
    if (!lastFiveById[id]) {
        lastFiveById[id] = []
    }
    return lastFiveById[id]
}

export const makeGetLastN = (id: number = 0) => {
    if (!lastFiveById[id]) {
        lastFiveById[id] = []
    }
    return (n: number) => {
        // needs to be redone as more of a state machine

        const lastTwo = lastFive(id).slice(lastFive(id).length - n).reduce((accum: string, ke: KeyboardEvent, idx: number) => {
            // browser-only above line
            if (ke.type !== 'keyup' && ke.type !== 'keydown') {
                if ((ke as any).sequence === undefined) {
                    console.log('rejecting key; type', ke, 'type is ', ke.type)
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

        return lastTwo
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
