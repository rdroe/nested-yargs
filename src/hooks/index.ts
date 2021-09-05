import { AppArguments } from '../appTypes'
import { put, Entry } from '../lib/store'

export const context: {
    [props: string]: null | Function | Promise<any>
} = {
    currentPromise: null,
    currentResolve: null
}

const hooks: {
    [hookName: string]: Function
} = {
    resolver: null
}

export const cache = async (argv: AppArguments, data: object) => {

    if (!argv || data === undefined) {
        return
    }

    const cacheDrilldown =
        argv.c
            ? argv.c
            : '.'

    if (typeof cacheDrilldown !== 'string') {
        return
    }

    // don't cache recusrively in case this was a cli call to a cache get or put.
    if ((argv._ || []).includes('cache')) {
        return
    }

    const entry: Entry =
    {
        commands: argv['c:c']?.length
            ? argv['c:c'].map(cm => `${cm}`)
            : argv._.map(cm => `${cm}`),

        names: argv['c:n']?.length
            ? argv['c:n'].map(n => `${n}`)
            : [],

        _jq: cacheDrilldown,
        value: data
    }

    await put(entry)
}

export default hooks

export const add = (name: string, hook: Function) => {
    hooks[name] = hook
}
