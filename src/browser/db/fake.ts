import 'fake-indexeddb/auto'
import { Dexie as DexieCore } from 'dexie'
import { Cache } from '../../shared/utils/types'


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

export const Dexie = DexieCore
export const db = new UiDb;
