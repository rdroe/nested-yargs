import * as fidb from 'fake-indexeddb'
import { Dexie as DexieCore } from 'dexie'
import { Cache, OptionalIndexes, UserTables } from '../../shared/utils/types'
import { UserTablesDb } from 'shared/utils/classes'



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
        return new UserTablesDb()
    }

    return new UserTablesDb;
}

type UtReturned = ReturnType<typeof userTables_>

const utSingleton: {
    ut: UtReturned
} = { ut: userTables_(true) }


export const userTables: UserTables = {

    add: async (table, puttable) => {
        const utDb = await utSingleton.ut
        const createdAt = Date.now()
        return utDb.userTables.add({ table, ...puttable, createdAt })
    },
    where: async (table, indexes) => {
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
