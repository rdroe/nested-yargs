
import 'fake-indexeddb/auto'
import { Dexie as DexieCore } from 'dexie'

export interface Cache {
    id?: number
    names: Array<string> | '*'
    commands: Array<string> | '*'
    value: any
    createdAt: number
}

export class UiDb extends DexieCore {
    public cache: Dexie.Table<Cache>

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
