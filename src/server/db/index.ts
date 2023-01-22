import * as fidb from 'fake-indexeddb'
import { Dexie as DexieCore, DexieOptions } from 'dexie'
import { Cache } from '../../shared/utils/types'

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

class UserTables extends NyargsDb {
    public userTables: DexieCore.Table<{
        id?: number,
        table: string,
        data: { [key: string]: any },
        createdAt: number
    } & OptionalIndexes>
    public constructor() {

        super("UserTables", { indexedDB: fidb.indexedDB, IDBKeyRange: fidb.IDBKeyRange })
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

export class UiDb extends DexieCore {
    public cache: DexieCore.Table<Cache>

    public constructor() {
        super("UiDb", { indexedDB: fidb.indexedDB, IDBKeyRange: fidb.IDBKeyRange })
        this.version(1).stores({
            cache: 'id++, *names, *commands, value, [commands+names], createdAt'
        });
        this.cache = this.table('cache')
    }
}

export const db = async (_?: boolean) => new UiDb;

export const Dexie = DexieCore

const userTables_ = async (useFake: boolean) => {
    if (useFake === true) {
        return new UserTables()
    }

    return new UserTables;
}

type UtReturned = ReturnType<typeof userTables_>

const utSingleton: {
    ut: UtReturned
} = { ut: userTables_(true) }


type Uts = InstanceType<typeof UserTables>
type UtsWhere = ReturnType<Uts['userTables']['where']>
type UtsAdd = ReturnType<Uts['userTables']['add']>


export const userTables = {

    add: async (table: string, data: { [key: string]: any }, indexes: OptionalIndexes): Promise<UtsAdd> => {
        const utDb = await utSingleton.ut
        const createdAt = Date.now()
        return utDb.userTables.add({ table, ...filteredOptionals(indexes), data, createdAt })
    },
    where: async (table: string, indexes: { id?: number } & OptionalIndexes): Promise<UtsWhere> => {
        const utDb = await utSingleton.ut
        return utDb.userTables.where({ table, ...filteredOptionals(indexes) })
    },
    update: async (table: string, data: { [key: string]: any }, optionalIndexes: { id?: number } & OptionalIndexes = defaultIndexes): Promise<ReturnType<Uts['userTables']['update']>> => {
        const utDb = await utSingleton.ut
        const filteredIdxs = filteredOptionals(optionalIndexes)
        const search: { table: string } & OptionalIndexes = { table, ...filteredIdxs }
        const { id, ...filteredMinusId } = filteredIdxs
        return utDb.userTables.where(search).modify({ data, ...filteredMinusId })
    },
    upsert: async (table: string, data: { [key: string]: any }, optionalIndexes: { id?: number } & OptionalIndexes = defaultIndexes): Promise<ReturnType<Uts['userTables']['update']>> => {
        const filteredIdxs = filteredOptionals(optionalIndexes)
        const gotten = await userTables.where(table, filteredIdxs)
        if (gotten && (await gotten.toArray()).length > 0) {
            const updateRes = await userTables.update(table, data, filteredIdxs)
            return updateRes
        }
        const res = await userTables.add(table, data, filteredIdxs)
        return res
    },
    config: async (key: string, val: string | null = null): Promise<ReturnType<Uts['userTables']['update']> | { [key: string]: any }> => {
        if (val === null) {
            const gotten = await userTables.where('config', { a: key })
            return (await gotten.first()).data
        }
        return userTables.upsert('config', { value: val })
    },
    configVariant: async (key: string, variant: string, val: string | null = null): Promise<ReturnType<Uts['userTables']['update']> | { [key: string]: any }> => {
        if (val === null) {
            const gotten = await userTables.where('config', { a: key, b: variant })
            return (await gotten.first()).data
        }
        return userTables.upsert('config', { value: val }, { b: variant })
    }
}
