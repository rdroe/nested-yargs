import { AppArguments } from '../appTypes'
import { put, Entry } from '../lib/store'

const jq = require('node-jq')

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
    console.log('argv; cache', argv, ' data', data)
    if (!argv || data === undefined) {
        return
    }

    const cacheDrilldown =
        argv.c
            ? argv.c
            : '.'
    console.log('cacheDrilldown', cacheDrilldown)
    if (typeof cacheDrilldown !== 'string') {
        return
    }

    // don't cache recusrively in case this was a cli call to a cache get or put.
    if (argv._.includes('cache')) {
        return
    }

    const entry: Entry =
    {
        commands: argv['c:c']?.length
            ? argv['c:c'].map(cm => `${cm}`)
            : argv._.map(cm => `${cm}`),

        names: argv['c:n']?.length
            ? argv['c:n']
            : [],

        _jq: cacheDrilldown,
        value: data
    }
    console.log('cache entry', entry)
    await put(entry)
}

export default hooks

export const add = (name: string, hook: Function) => {
    hooks[name] = hook
}


