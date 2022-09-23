import { setDictionary } from 'commands/program'
import isNode from './isNode'
import { ConfigOptions, Modules } from './types'
export const platformIsNode = isNode()
type Main = typeof import('../../server/exports') | typeof import('../../browser/exports')
type Yargs = typeof import('yargs')

const importPlatform = async (): Promise<{
    main: Main,
    yargs: Yargs
}> => {
    if (platformIsNode) {

        // @ts-ignore
        const main = await import('../../server/exports')
        // @ts-ignore
        await import('fake-indexeddb/auto')
        // @ts-ignore
        const yargs = (await import('yargs')) as typeof import('yargs')
        return { main, yargs }
    }
    const init = (await import('browser/init')).default
    init()
    // @ts-ignore
    const main = (await import('../../browser/exports'))
    // @ts-ignore
    const yargs = (await import('https://unpkg.com/yargs@16.0.0-beta.1/browser.mjs')).default

    return { main, yargs }


}

export type CreateAppArg = (main: Main, yargs: Yargs) => void

type AppCreator = (fnOrModules: CreateAppArg | Modules, configurators?: {
    config?: { [Settable in keyof ConfigOptions]: ConfigOptions[Settable] },
    programs?: Parameters<typeof setDictionary>[0]
}, prompt?: string) => Promise<void>


type AppCreator1 = (main: Main, yargs: Yargs, fn: CreateAppArg) => Promise<void>

type AppCreator2 = (main: Main, yargs: Yargs, modules: Modules, configurators?: {
    config?: { [Settable in keyof ConfigOptions]: ConfigOptions[Settable] },
    programs?: Parameters<typeof setDictionary>[0]
}, prompt?: string) => Promise<void>



const createAppFromFn: AppCreator1 = async (main, yargs, fn) => {
    if (platformIsNode) {
        return fn(main, yargs)
    }
    return fn(main, yargs())
}

const createAppFromObj: AppCreator2 = async (main, yargs, modules, configurators, prompt) => {

    const { cache, program, test, repl, setDictionary, configure, nest, element, match } = main

    const { config = {}, programs = {} } = configurators
    setDictionary(programs)
    Object.entries(config).forEach(
        ([configurable, configVal]) => configure(configurable as keyof typeof config, configVal))
    let y: Yargs | ReturnType<Yargs>
    if (platformIsNode) {
        y = yargs
    } else {
        y = yargs()
    }

    repl({ ...modules, match, cache, program, test, nest, element }, y, prompt)
}

const createApp: AppCreator = async (fnOrModules: CreateAppArg | Modules, configurators?: {
    config?: { [Settable in keyof ConfigOptions]: ConfigOptions[Settable] },
    programs?: Parameters<typeof setDictionary>[0]
}, prompt?: string) => {

    const { main, yargs, } = await importPlatform()
    if (typeof fnOrModules === 'function') {
        return createAppFromFn(main, yargs, fnOrModules)
    }
    return createAppFromObj(main, yargs, fnOrModules, configurators, prompt)

}

export default createApp
