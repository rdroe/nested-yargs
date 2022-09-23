import { indexedDB, IDBKeyRange } from "fake-indexeddb";
import DexieCore, { DexieOptions } from 'dexie'
import { Cache, DbFiles } from '../../shared/utils/types'

class NyargsDb extends DexieCore {
    public constructor(tableName: string, options: DexieOptions = {}) {
        super(tableName, options)
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
