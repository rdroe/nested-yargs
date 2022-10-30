import { BaseArguments, Result } from '../shared/utils/types'
import { put, Entry } from './store'
import { dbPath } from '../shared/utils/dbPath'
import { importFromJson, clearDatabase, exportToJson } from '../shared/idb-backup-and-restore'
import { get } from '../shared'

export const dbPathUtil = dbPath
export const context: {
    [props: string]: null | Function | Promise<any>
} = {
    currentPromise: null,
    currentResolve: null
}

const cacheResult = async (argv: BaseArguments & {}, data: object) => {


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

        value: data,
        filters: argv?.filters
    }

    await put(entry)
}

export const cache = async <Storable extends { isMultiResult?: boolean, list?: { [key: string]: any } } = Result>(
    argv: BaseArguments,
    data: Storable) => {
    if (argv.help) {
        console.log('escaping cache (help)')
        return
    }

    if (!data.isMultiResult || !data.list) {
        return cacheResult(argv, data)
    }

    const proms = Object.entries(data.list)
        .map(([commandStr, cacheable]) => {
            const defaultArgv = { ...argv, 'c:c': commandStr.split(' ') }
            // const ownArgv = data.argv[commandStr]
            return cacheResult(
                /*ownArgv ||*/ defaultArgv,
                cacheable
            )
        })
    return Promise.all(proms)
}

/*
  variadic; if path and f are both there, take them to be a filename's path and actual filename. If only path, assume it's actually the full filename, and there is no 3rd arg.
 */
export async function importDb(path: string, f: string | IDBDatabase, dbBack?: IDBDatabase): Promise<string> {
    const fs = await get('fs')
    const idbDatabase = typeof f === 'string' ? dbBack : f
    const builtPath = typeof f === 'string' ? dbPath(path, f) : { fullpath: path }

    const {
        fullpath
    } = builtPath
    const file = await fs.readFile(fullpath, 'utf8')
    console.log('importing db', idbDatabase)
    await clearDatabase(idbDatabase)
    await importFromJson(idbDatabase, file)
    console.log('imported from ', fullpath)
    return
}


export async function exportDb(p: any, f?: any, dbBack?: any): Promise<string> {
    const fs = await get('fs')
    const { subdirs, fullpath } = dbPath(p, f)
    await fs.mkdir(subdirs.join('/'), { recursive: true })
    const fname = fullpath

    const str = await exportToJson(dbBack);
    await fs.writeFile(fname, str, 'utf8')
    console.log(`wrote ${fname}; data: ${str}`)
    return fname
}
