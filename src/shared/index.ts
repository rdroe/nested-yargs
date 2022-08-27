import { Files, PartialFs, Db, TerminalUtils, PrintResult, HistoryListener, RenewReader, Readline, SaveHistory, LoadHistory, Configuration, ConfigOptions, SetAll, keyofConfigOptions } from "./utils/types"
import isNode from './utils/isNode'
type DepName = keyof Deps

type Awaitable = <DN extends keyof Deps>(dn: DN) => Promise<Deps[typeof dn]>

const depsRef: Deps = {} = {}

export const configuration: Configuration = {
    server: {},
    browser: {},
    shared: {}
}

export const configured: {
    resolver: null | (() => void)
    ready: null | Promise<void>
} = {
    resolver: null,
    ready: null
}
/**
   first, user config should happen. that should happen in the app they write: configure(propName, value)
   then a primary call such as setUp.ts > repl, calls setAll.
   it first sets configurations that are not already set by the user, setting to defaults.
   then it does the server / browser sets that are not necessarily user configurable.
   that should happen first. 
*/
configured.ready = new Promise((resolve) => {
    configured.resolver = () => { resolve() }
})

export const get: Awaitable = async <T extends DepName>(dn: T): Promise<Deps[T]> => {
    if (dn !== 'setAll') {
        await configured.ready
    }

    if (isConfigOption(dn)) {
        const configuredMsg = `configuration for ${dn}, overrode the default "set()" call`
        const asConfigured = getConfig(dn as keyof ConfigOptions)
        if (asConfigured) {
            console.log(configuredMsg)
            return asConfigured as Deps[T]
        }
    }
    if (!depsRef[dn]) throw new Error(`No dep available at ${dn}`)

    return depsRef[dn]
}

export const set = <D extends DepName>(depName: D, newDep: Deps[D]) => {
    depsRef[depName] = newDep
}

type Platform = 'server' | 'browser'

const isPlatform = (arg: any): arg is Platform => {
    return ['server', 'browser'].includes(arg)
}

const isConfigOption = (arg: any): arg is keyof ConfigOptions => {
    return keyofConfigOptions.includes(arg)
}

export const getConfig = <Dn extends keyof ConfigOptions>(dn: Dn): ConfigOptions[Dn] => {

    const plat = isNode() ? 'server' : 'browser'
    if (Object.keys(configuration[plat]).includes(dn)) {
        return configuration[plat][dn]
    } else if (Object.keys(configuration.shared).includes(dn)) {
        return configuration.shared[dn]
    }

}

export const configure = <Settable extends keyof ConfigOptions>(
    optionOrPlatform: keyof Configuration | Settable,
    optionOrValue?: Settable | ConfigOptions[Settable],
    value?: ConfigOptions[Settable]
) => {

    let configSection: ConfigOptions
    let settable: Settable
    let settableVal: ConfigOptions[typeof settable]

    if (isPlatform(optionOrPlatform)) {
        if (isConfigOption(optionOrValue)) {
            settable = optionOrValue
        }
        if (!value) throw new Error('A third config argument is required when platform is supplied as the first.')
        settableVal = value
        configSection = configuration[optionOrPlatform]
    } else {
        configSection = configuration.shared
        settable = optionOrPlatform as Settable
        settableVal = optionOrValue as ConfigOptions[Settable]
    }
    configSection[settable] = settableVal

}


type Deps = {
    'setAll'?: SetAll
    'fs'?: PartialFs
    'files'?: Files
    'db'?: Db
    'readline'?: Readline
    'renewReader'?: RenewReader
    'historyListener'?: HistoryListener
    'terminalUtils'?: TerminalUtils
    'printResult'?: PrintResult
    'saveHistory'?: SaveHistory
    'loadHistory'?: LoadHistory
}
