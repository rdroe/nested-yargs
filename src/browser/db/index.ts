import { indexedDB, IDBKeyRange } from "fake-indexeddb";
import DexieCore, { DexieOptions } from 'dexie'
import { Cache, DbFiles } from '../../shared/utils/types'
import { platformIsNode } from "shared/utils/createApp";

class NyargsDb extends DexieCore {
    public constructor(tableName: string, options: DexieOptions = {}) {
        super(tableName, options)
    }
}
type OptionalIndexes = {
    b?: string | number
    c?: string | number
    d?: string | number
    e?: string | number
    f?: string | number
}

const defaultIndexes: OptionalIndexes = {
    b: undefined, c: undefined, d: undefined, e: undefined, f: undefined
}

class UserTables extends NyargsDb {
    public userTables: DexieCore.Table<{
        id?: number
        table: string
        a: string
        data: { [key: string]: any }
        createdAt: number
    } & OptionalIndexes>
    public constructor(options: DexieOptions = {}) {
        super("UserTables", options)
        this.version(1).stores({
            userTables: 'id++,table, a, [table+a], b, [table+b], [table+a+b], c, [table+a+c], [table+a+b+c], [table+a+c], d, [table+a+b+c+d], e, [table+a+b+c+d+e], f, [table+a+b+c+d+e+f], data, createdAt'
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
        return new UserTables({ indexedDB: indexedDB, IDBKeyRange: IDBKeyRange })
    }

    return new UserTables;
}

type UtReturned = ReturnType<typeof userTables_>

const utSingleton: {
    ut: UtReturned
} = { ut: userTables_(platformIsNode) }


type Uts = InstanceType<typeof UserTables>
type UtsWhere = ReturnType<Uts['userTables']['where']>
type UtsAdd = ReturnType<Uts['userTables']['add']>


export const userTables = {

    add: async (table: string, data: { [key: string]: any }, indexes: { a: string } & OptionalIndexes): Promise<UtsAdd> => {
        const utDb = await utSingleton.ut
        const createdAt = Date.now()
        return utDb.userTables.add({ table, a: indexes.a, ...indexes, data, createdAt })
    },
    where: async (table: string, indexes: { id?: number, a: string } & OptionalIndexes): Promise<UtsWhere> => {
        const utDb = await utSingleton.ut
        return utDb.userTables.where({ table, ...indexes })
    },
    update: async (table: string, a: string, data: { [key: string]: any }, optionalIndexes: OptionalIndexes = defaultIndexes): Promise<ReturnType<Uts['userTables']['update']>> => {
        const utDb = await utSingleton.ut
        const search: { table: string, a: string } & OptionalIndexes = { table, a, ...optionalIndexes }
        return utDb.userTables.where(search).modify({ data })
    },
    upsert: async (table: string, a: string, data: { [key: string]: any }, optionalIndexes: OptionalIndexes = defaultIndexes): Promise<ReturnType<Uts['userTables']['update']>> => {

        const indexes: { table: string, a: string } & OptionalIndexes = { table, a, ...optionalIndexes }
        const gotten = await userTables.where(table, indexes)
        if (gotten && (await gotten.count()) > 0) {
            return userTables.update(table, a, data, optionalIndexes)
        }
        return userTables.add(table, data, { a, ...optionalIndexes })
    },
    config: async (key: string, val: string | null = null): Promise<ReturnType<Uts['userTables']['update']> | { [key: string]: any }> => {
        if (val === null) {
            const gotten = await userTables.where('config', { a: key })
            return (await gotten.first()).data
        }
        return userTables.upsert('config', key, { value: val })
    },
    configVariant: async (key: string, variant: string, val: string | null = null): Promise<ReturnType<Uts['userTables']['update']> | { [key: string]: any }> => {
        if (val === null) {
            const gotten = await userTables.where('config', { a: key, b: variant })
            return (await gotten.first()).data
        }
        return userTables.upsert('config', key, { value: val }, { b: variant })
    }

}

