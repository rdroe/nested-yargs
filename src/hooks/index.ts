import { AppArguments } from '../appTypes'
import { put, Entry } from '../lib/store'
import { dbPath } from '../lib/util'
import fs from 'fs'
import { importFromJson, clearDatabase, exportToJson } from '../lib/idb-backup-and-restore'
import shelljs from 'shelljs'

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

const cacheResult = async (argv: AppArguments, data: object) => {

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

export const cache = async (argv: AppArguments, data: { isMultiResult?: boolean, list: { [commandStr: string]: any } }) => {

    if (!data.isMultiResult || !data.list) {
        return cacheResult(argv, data)
    }
    const proms = Object.entries(data.list)
        .map(([commandStr, cacheable]) => {
            console.log('commandStr, cacheable', commandStr, cacheable)
            return cacheResult(
                { ...argv, 'c:c': commandStr.split(' ') },
                cacheable
            )
        })
    return Promise.all(proms)
}


export default hooks

export const add = (name: string, hook: Function) => {
    hooks[name] = hook
}



export async function importDb(path: string, f: string, dbBack: IDBDatabase): Promise<string> {
    const {
        fullpath
    } = dbPath(path, f)
    const file = fs.readFileSync(fullpath, 'utf8')
    await clearDatabase(dbBack)
    await importFromJson(dbBack, file)
    return
}

// example for user database:
// exportDb('data', 'rbdb2/test.json', rbDb.backendDB())
export async function exportDb(p: string, f: string, dbBack: IDBDatabase): Promise<string> {
    const { subdirs, fullpath } = dbPath(p, f)
    shelljs.mkdir(subdirs.join('/'))
    const fname = fullpath
    const dat = await exportToJson(dbBack)
    fs.writeFileSync(fname, dat, 'utf8')
    console.log(`wrote ${fname}`)
    return fname
}
