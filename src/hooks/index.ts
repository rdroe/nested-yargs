import { AppArguments, Result } from '../appTypes'
import { put, Entry } from '../lib/store'
import { dbPath } from '../lib/util'
import { importFromJson, clearDatabase, exportToJson } from '../lib/idb-backup-and-restore'
import { isNode } from '../lib/dynamic'


type Fs = {
    readFileSync: Function,
    writeFileSync: Function
}

type ShellJs = {
    mkdir: Function
}

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

        value: data,
        filters: argv?.filters
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

export async function importDb(fs: any, path: any, f?: any, dbBack?: any): Promise<string> {

    if (typeof f !== 'string') throw new Error("-f (--filename) requires a string ")
    const {
        fullpath
    } = dbPath(path, f)
    console.log('importing path', fullpath, '(from', path, f, ')')
    const file = await fs.readFileSync(fullpath, 'utf8')
    console.log('dbBack', dbBack)

    await clearDatabase(dbBack)
    await importFromJson(dbBack, file)
    console.log('imported from ', fullpath)
    return
}


export async function exportDb(fs: any, shelljs: any, p: any, f?: any, dbBack?: any): Promise<string> {

    const { subdirs, fullpath } = dbPath(p, f)
    shelljs.mkdir('-p', subdirs.join('/'))
    const fname = fullpath
    const dat = await exportToJson(dbBack);
    fs.writeFileSync(fname, dat, 'utf8')
    console.log(`wrote ${fname}; data: ${dat}`)
    return fname
}
