// import 'fake-indexeddb/auto'
import { Dexie as DexieCore } from 'dexie'
import { Cache, DbFiles } from '../../shared/utils/types'


export class UiDb extends DexieCore {
    public cache: DexieCore.Table<Cache>

    public constructor() {
        super("UiDb")
        this.version(1).stores({
            cache: 'id++, *names, *commands, value, [commands+names], createdAt'
        });
        this.cache = this.table('cache')
    }
}

export class FilesDb extends DexieCore {
    public files: DexieCore.Table<DbFiles>
    public constructor() {
        super("FilesDb")
        this.version(1).stores({
            files: 'name, data, createdAt'
        });
        this.files = this.table('files')
    }
}


export const Dexie = DexieCore

export const db = new UiDb;
export const filesDb = new FilesDb;
