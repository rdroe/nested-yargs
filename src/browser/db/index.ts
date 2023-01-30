import { indexedDB, IDBKeyRange } from "fake-indexeddb";
import DexieCore, { DexieOptions } from 'dexie'
import { Cache, DbFiles, UserTables } from '../../shared/utils/types'
import { platformIsNode } from "shared/utils/createApp";

class NyargsDb extends DexieCore {
    public constructor(tableName: string, options: DexieOptions = {}) {
        super(tableName, options)
    }
}

type OptionalIndexes = {
    a?: string | number
    b?: string | number
    c?: string | number
    d?: string | number
    e?: string | number
    f?: string | number
    g?: string | number
    h?: string | number
}

const defaultIndexes: OptionalIndexes = {
    a: undefined,
    b: undefined, c: undefined, d: undefined, e: undefined, f: undefined, g: undefined, h: undefined
}

const filteredOptionals = (idxs: { id?: number } & OptionalIndexes) => {
    const indexes = Object.fromEntries(
        Object.entries(idxs).filter(([, v]) => {
            return v !== undefined
        })
    ) as { table: string, id?: number } & OptionalIndexes
    return indexes
}

class UserTablesDb extends NyargsDb {
    public userTables: DexieCore.Table<{
        id?: number
        table: string

        data: { [key: string]: any }
        createdAt: number
    } & OptionalIndexes>
    public constructor(options: DexieOptions = {}) {
        super("UserTablesDb", options)
        this.version(1).stores({
            userTables: `
id++,
table,
a,
[table+a], 
b,
[table+b],
[table+a+b],
c,
[table+c],
[table+a+c],
[table+a+b+c], 
d,
[table+d],
[table+a+b+c+d], 
e,
[table+e],
[table+a+b+c+d+e], 
f,
[table+f],
[table+a+b+c+d+e+f], 
data,
g,
[table+g],
[table+a+b+c+d+e+f+g],
h,
[table+h],
[table+a+b+c+d+e+f+g+h],
createdAt
`.replace(/\n/g, '')
        });
        this.userTables = this.table('userTables')
    }
}

export class UiDb extends NyargsDb {

    public cache: DexieCore.Table<Cache>

    public constructor(options: DexieOptions = {}) {
        super("UiDb", options)
        this.version(1).stores({
            cache: 'id++, *names, *commands, value, [commands+names], createdAt'
        });
        this.cache = this.table('cache')
    }
}

export class FilesDb extends NyargsDb {
    public files: DexieCore.Table<DbFiles>
    public constructor(options: DexieOptions = {}) {
        super("FilesDb", options)
        this.version(1).stores({
            files: 'name, data, createdAt'
        });
        this.files = this.table('files')
    }
}

export const Dexie = DexieCore

export const db = async (useFake: boolean) => {
    if (useFake === true) {
        return new UiDb({ indexedDB: indexedDB, IDBKeyRange: IDBKeyRange })
    }
    return new UiDb
};

export const filesDb = async (useFake: boolean) => {
    if (useFake === true) {
        return new FilesDb({ indexedDB: indexedDB, IDBKeyRange: IDBKeyRange })
    }

    return new FilesDb;
}

const userTables_ = async (useFake: boolean) => {
    if (useFake === true) {
        return new UserTablesDb({ indexedDB: indexedDB, IDBKeyRange: IDBKeyRange })
    }

    return new UserTablesDb;
}

type UtReturned = ReturnType<typeof userTables_>

const utSingleton: {
    ut: UtReturned
} = { ut: userTables_(platformIsNode) }

export const userTables: UserTables = {

    add: async (table: string, puttable) => {
        const utDb = await utSingleton.ut
        const createdAt = Date.now()
        return utDb.userTables.add({ table, ...puttable, createdAt })
    },
    where: async (table: string, indexes) => {
        const utDb = await utSingleton.ut
        return utDb.userTables.where({ table, ...filteredOptionals(indexes) })
    },
    update: async (table, data, optionalIndexes = defaultIndexes) => {
        const utDb = await utSingleton.ut
        const filteredIdxs = filteredOptionals(optionalIndexes)
        const search: { table: string } & OptionalIndexes = { table, ...filteredIdxs }
        const { id, ...filteredMinusId } = filteredIdxs
        return utDb.userTables.where(search).modify({ data, ...filteredMinusId })
    },
    upsert: async (table, dataAndIdxs, searchIdxs = defaultIndexes) => {

        const filteredIdxs = filteredOptionals(searchIdxs)
        const gotten = await userTables.where(table, filteredIdxs)

        if (gotten && (await gotten.toArray()).length > 0) {
            const updateRes = await userTables.update(table, dataAndIdxs, filteredIdxs)
            return updateRes
        }

        const res = await userTables.add(table, dataAndIdxs)
        return res
    },
    config: async (key, val = null) => {
        if (val === null) {
            const gotten = await userTables.where('config', { a: key })
            return (await gotten.first()).data.value
        }
        await userTables.upsert('config', { data: { value: val } }, { a: key })
        return
    },
    configVariant: async (key, variant, val = null) => {
        if (val === null) {
            const gotten = await userTables.where('config', { a: key, b: variant })
            return (await gotten.first()).data.value
        }
        await userTables.upsert('config', { data: { value: val } }, { a: val, b: variant })
        return
    }
}
export const getUserTables = () => Promise.resolve(userTables)
