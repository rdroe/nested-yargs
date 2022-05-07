import { AppArguments, Result } from '../appTypes'
import { put, Entry } from '../lib/store'
import { dbPath } from '../lib/util'
import { importFromJson, clearDatabase, exportToJson } from '../lib/idb-backup-and-restore'
import { isNode } from '../../index'


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

        //        commands: argv.positional.map(x => `${x}`) ?? [],
        names: argv['c:n']?.length
            ? argv['c:n'].map(n => `${n}`)
            : [],

        _jq: cacheDrilldown, // why is a jq arg needed here?
        value: data
    }

    await put(entry)
}

export const cache = async (
    argv: AppArguments,
    data: Result) => {

    if (argv.help === true) {
        console.log('escaping cache (help)')
        return
    }

    if (!data.isMultiResult || !data.list) {
        return cacheResult(argv, data)
    }

    const proms = Object.entries(data.list)
        .map(([commandStr, cacheable]) => {
            const defaultArgv = { ...argv, 'c:c': commandStr.split(' ') }
            const ownArgv = data.argv[commandStr]
            return cacheResult(
                ownArgv || defaultArgv,
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
    if (!isNode()) {
        throw new Error('Cannot use importDb in non-Node env')
    }
    const fs = await import('fs')
    if (typeof f !== 'string') throw new Error("-f (--filename) requires a string ")
    const {
        fullpath
    } = dbPath(path, f)
    if (!isNode()) {
        console.error('ERROR: Non-node environment.')
        return 'ERROR'
    }
    const file = fs.readFileSync(fullpath, 'utf8')
    await clearDatabase(dbBack)
    await importFromJson(dbBack, file)
    console.log('imported from ', fullpath)
    return
}

// example for user database:
// exportDb('data', 'rbdb2/test.json', rbDb.backendDB())
export async function exportDb(p: string, f: string, dbBack: IDBDatabase): Promise<string> {
    if (!isNode()) {
        throw new Error('Cannot use exportDb in non-Node env')
    }
    const fs = await import('fs')
    const shelljs = await import('shelljs')
    const { subdirs, fullpath } = dbPath(p, f)
    shelljs.mkdir('-p', subdirs.join('/'))
    const fname = fullpath
    const dat = await exportToJson(dbBack);
    (fs as any).writeFileSync(fname, dat, 'utf8')
    console.log(`wrote ${fname}`)
    return fname
}
