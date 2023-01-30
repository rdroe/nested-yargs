import { Scanner, ScannerCliIds, ScannerGuard, WrappedUserFn, WrappedUserListenerFns } from './types'
import { getSingleton, setSingleton } from 'shared/utils/singletons';

import { FakeCli, Module, ReadlineInterface, UserListenerFns } from 'browser/exports';

import { addListener } from 'shared/utils/makeGetLastN';
import { collapseBlanks, secondContainsFirst } from 'shared/helpers';
import { getConfig, configuration } from 'shared';

const fakeCli = getSingleton<FakeCli>('fakeCli').default
const getRandomAlphanumeric = (): string => Math.random().toString(36).slice(2)

setSingleton('timeout-ids', {} as { [key: string]: undefined | ReturnType<typeof setTimeout> });

const getLogger = (str: string) => {
    return (...args: any[]) => {
        console.log(`${str}:`, ...args)
    }
}

const getNoop = () => {
    return (...args: any[]) => { }
}

const LOG_MATCHING = true as boolean
let LOG_WRAPPING: boolean = true
const matchlog = LOG_MATCHING === false ? getNoop() : getLogger('matchers')
const wraplog = (LOG_WRAPPING as boolean) === false ? getNoop() : getLogger('wrappers')

export const getThrottledBool = function getThrottledBool(fn: WrappedUserFn, throttle: number, nm: string, scanner: Scanner): UserListenerFns['fn'] {

    const timeoutIds = getSingleton('timeout-ids') as { [key: string]: undefined | ReturnType<typeof setTimeout> }

    return function getThrottledBoolRet(key, curReadline, evRecipient) {
        if (timeoutIds[nm] !== undefined) {
            clearTimeout(timeoutIds[nm])
        }

        return new Promise<boolean>((resolve) => {
            timeoutIds[nm] = setTimeout(async function throttledTimeoutFn() {
                wraplog('calling awaitable default fn', fn)
                const throttledResult = await fn(key, curReadline, evRecipient, scanner)
                wraplog('throttled result', throttledResult)
                return resolve(throttledResult)
            }, throttle)
        })
    }
}

let programModule: Module[]

const matchModules = (scannerModules: ScannerGuard, cliText: string) => {

    console.log('fake cli', fakeCli)

    if (!programModule) {
        programModule = fakeCli.getMatchingModules()('program')
    }

    const modulesNamedInCli = fakeCli.getMatchingModules()(cliText);
    matchlog('prog module', programModule)
    matchlog('modules for user command', modulesNamedInCli)

    const containsProgModule = secondContainsFirst(programModule, modulesNamedInCli)
    matchlog(' modules for program', modulesNamedInCli)
    if (containsProgModule) {
        matchlog('prog did not match');
        return false
    }

    if (scannerModules === undefined) {
        matchlog('undefined scanner modules; returning true'); return true
    }

    const requiredModules = typeof scannerModules === 'string' ? fakeCli.getMatchingModules()(scannerModules) : scannerModules
    matchlog('required:', requiredModules)
    const final = requiredModules.length === 0 || secondContainsFirst(requiredModules, modulesNamedInCli)
    matchlog('final:', final)
    return final
}

const matchRecipients = (moduleCliIds: ScannerCliIds, recipient: number) => {

    if (moduleCliIds === '*') return true
    let nums: number[]
    if (typeof moduleCliIds === 'number') {
        nums = [moduleCliIds]
    } else {
        nums = moduleCliIds
    }
    return nums.includes(recipient)
}

const extractTaId = (ta: HTMLTextAreaElement) => {
    const id = (ta as { id: string }).id
    const splitted = id.split('-')
    return parseInt(splitted.pop())
}

const voidNoop: UserListenerFns['a'] = async (key, curReadline, evRecipient) => { }
const trueNoop: UserListenerFns['b'] = async (key, curReadline, evRecipient) => true

const wrapFn = (scanner: Scanner, userFunction: WrappedUserFn | WrappedUserFn<void>, noop: WrappedUserFn | WrappedUserFn<void>): WrappedUserFn<void> => {

    const wrappedFn: WrappedUserFn<void> = async (key, curReadline, evRecipient, sc1) => {
        const rawText = (key.target as HTMLTextAreaElement).value
        const cliText = sc1.preprocess ? sc1.preprocess(rawText) : rawText
        const recipientId = extractTaId(key.target as HTMLTextAreaElement)

        if (!rawText.trim()) { return }

        if (!matchModules(sc1.allow, cliText)) {
            await noop(key, curReadline, evRecipient, scanner)
            return
        }
        if (!matchRecipients(sc1.cliIds, recipientId)) {
            await noop(key, curReadline, evRecipient, scanner)
            return
        }
        await userFunction(key, curReadline, evRecipient, scanner)
    }
    return wrappedFn

}

const wrapBoolFn = function wrapBoolFn(scanner: Scanner, userFunction: WrappedUserFn | WrappedUserFn<void>, noop: WrappedUserFn | WrappedUserFn<void>): WrappedUserFn<boolean> {

    const wrappedFn: WrappedUserFn<boolean> = async function wrapBoolRetFn(key, curReadline, evRecipient, sc1) {

        const rawText = (key.target as HTMLTextAreaElement).value
        const cliText = sc1.preprocess ? sc1.preprocess(rawText) : rawText

        wraplog('wrapped key.target:', key.target)
        const recipientId = extractTaId(key.target as HTMLTextAreaElement)
        wraplog('if matches are succesful, will call', userFunction)

        if (!rawText.trim()) { return }
        if (!matchModules(sc1.allow, cliText)) {
            wraplog('did not match modules')
            return !!(await noop(key, curReadline, evRecipient, sc1))
        }
        if (!matchRecipients(sc1.cliIds, recipientId)) {
            wraplog('did not match recipients', sc1.cliIds, recipientId)
            return !!(await noop(key, curReadline, evRecipient, sc1))
        }
        wraplog('matched all; calling user fn')
        return !!(await userFunction(key, curReadline, evRecipient, sc1))
    }

    return wrappedFn
}

const hasMessage = (e: unknown): e is HasMessage => {
    return typeof (e as InstanceType<typeof Error>).message === 'string' ? true : false
}

type HasMessage = { message: string }


type PreviewCaller<T> = (arg: T) => Promise<any>
type PreviewErrorHandler = (e: HasMessage) => any

export const keyListenerUtil = <T extends object>(kbEv: KeyboardEvent, curReadline: ReadlineInterface, taId: string, scanner: Scanner) => {

    const raw = collapseBlanks(curReadline.line) || null
    const cli = scanner.preprocess ? scanner.preprocess(raw) : raw
    if (!raw || !cli) {
        return { raw, cli, handlePreview: () => { }, setCoreHandler: () => { } }
    }

    let crudHandler: null | Parameters<typeof setCrudHandler>[0] = null
    const setCrudHandler = (fn: (raw1: string, cli1: string) => Promise<T>) => {
        if (!fn.name) throw new Error(`A scanner crud handler must be a named function (anonymous not allowed)`)

        crudHandler = fn
    }


    const render = async function render(previewFn: PreviewCaller<T>, errorFn?: PreviewErrorHandler): Promise<any> {

        if (crudHandler === null) throw new Error('setCoreHandler must be called before handle preview.')
        let result: T
        try {
            result = await crudHandler(raw, cli)
            if (!previewFn.name) throw new Error(`The custom render function must have a name (anonymous not allowed)`)
            return previewFn(result)
        } catch (e: unknown) {
            // @ts-ignore
            if (!hasMessage(e)) throw new Error('Could not verify this thrown thing as an error (see cause)', { cause: e })

            if (errorFn) {
                return errorFn(e)
            } else {
                throw e
            }
        }
    }
    return { raw, cli, render, setCrudHandler }
}

const getDefaultFn = (sc: Scanner): WrappedUserListenerFns['fn'] => async function defaultFn(kbEv, curReadline, taId) {
    const cli = collapseBlanks(curReadline.line)
    matchlog('cli in', cli)
    if (!cli) return false
    const processed = sc.preprocess ? sc.preprocess(cli) : cli
    // do something here to show the preview data.
    const result = await fakeCli.handle(processed)
    console.log('preview would have been a result of size', JSON.stringify(result).length)
    return true
}

const defaultB: WrappedUserListenerFns['b'] = trueNoop
const defaultA: WrappedUserListenerFns['a'] = voidNoop

const wrapFns = (scanner: Scanner): WrappedUserListenerFns => {

    if (!scanner.fn) {
        const wrappedUserFn = wrapBoolFn(scanner, getDefaultFn(scanner), trueNoop)
        const throttledWrappedUserFn = getThrottledBool(wrappedUserFn, scanner.throttle, getRandomAlphanumeric(), scanner)
        const defaultFn1 = scanner.throttle ? throttledWrappedUserFn : wrappedUserFn

        return {
            fn: defaultFn1,
            b: wrapBoolFn(scanner, defaultB, trueNoop),
            a: wrapFn(scanner, defaultA, voidNoop),
        }
    }

    if (typeof scanner.fn === 'function') {
        const wrappedUserFn = wrapBoolFn(scanner, scanner.fn, trueNoop)
        const throttledWrappedUserFn = getThrottledBool(wrappedUserFn, scanner.throttle, getRandomAlphanumeric(), scanner)
        const defaultFn1 = scanner.throttle ? throttledWrappedUserFn : wrappedUserFn


        return {
            fn: wrapBoolFn(scanner, defaultFn1, trueNoop),
            b: wrapBoolFn(scanner, trueNoop, trueNoop),
            a: wrapFn(scanner, voidNoop, voidNoop),
        }
    }
    return {
        fn: wrapBoolFn(scanner, scanner.fn?.fn ? scanner.fn.fn : getDefaultFn(scanner), trueNoop),
        b: wrapBoolFn(scanner, scanner.fn.b ?? trueNoop, trueNoop),
        a: wrapFn(scanner, scanner.fn.a ?? voidNoop, voidNoop),
    }
}

export { scanner as test } from './test'

export const addScanner = async (scanner: Scanner, name = `scanner-${getRandomAlphanumeric()}`) => {
    const wrappedFns = wrapFns(scanner)
    scanner.init().then(() => {
        addListener(name,
            (key, curReadline, evRecipient) => wrappedFns.fn(key, curReadline, evRecipient, scanner),
            (key, curReadline, evRecipient) => wrappedFns.b(key, curReadline, evRecipient, scanner),
            (key, curReadline, evRecipient) => wrappedFns.a(key, curReadline, evRecipient, scanner)
        )
    })

}
