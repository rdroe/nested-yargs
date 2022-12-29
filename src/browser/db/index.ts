import { indexedDB, IDBKeyRange } from "fake-indexeddb";
import DexieCore, { DexieOptions } from 'dexie'
import { Cache, DbFiles } from '../../shared/utils/types'
import { platformIsNode } from "shared/utils/createApp";

class NyargsDb extends DexieCore {
    public constructor(tableName: string, options: DexieOptions = {}) {
        super(tableName, options)
    }
}

class UserTables extends NyargsDb {
    public userTables: DexieCore.Table<{
        table: string,
        a: string,
        b?: string,
        c?: string,
        data: { [key: string]: any },
        createdAt: number
    }>
    public constructor(options: DexieOptions = {}) {
        super("UserTables", options)
        this.version(1).stores({
            userTables: 'table, id++, [table+id], a, [table+a], b, c, data, createdAt'
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

    add: async (table: string, data: { [key: string]: any }, indexes: { a: string, b?: string, c?: string }): Promise<UtsAdd> => {
        const utDb = await utSingleton.ut
        const { a, b, c } = indexes
        const createdAt = Date.now()
        return utDb.userTables.add({ table, a, b, c, data, createdAt })
    },
    where: async (table: string, indexes: { id?: number, a: string, b?: string, c?: string, createdAt?: string }): Promise<UtsWhere> => {
        const utDb = await utSingleton.ut

        return utDb.userTables.where({ table, ...indexes })
    },
    update: async (table: string, a: string, data: { [key: string]: any }, optionalIndexes: { b?: string, c?: string } = { b: undefined, c: undefined }): Promise<ReturnType<Uts['userTables']['update']>> => {
        const utDb = await utSingleton.ut
        const search: { table: string, a: string, b?: string, c?: string } = { table, a }
        if (optionalIndexes.b !== undefined) {
            search.b = optionalIndexes.b
        }
        if (optionalIndexes.c !== undefined) {
            search.c = optionalIndexes.c
        }
        return utDb.userTables.where(search).modify({ data })
    },
    upsert: async (table: string, a: string, data: { [key: string]: any }, optionalIndexes: { b?: string, c?: string } = { b: undefined, c: undefined }): Promise<ReturnType<Uts['userTables']['update']>> => {

        const indexes: { table: string, a: string, b?: string, c?: string } = { table, a }
        if (optionalIndexes.b !== undefined) {
            indexes.b = optionalIndexes.b
        }
        if (optionalIndexes.c !== undefined) {
            indexes.c = optionalIndexes.c
        }
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

    }

}

