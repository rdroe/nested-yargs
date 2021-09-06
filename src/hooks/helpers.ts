
interface ForeignDbs {
    [foreignDbName: string]: IDBDatabase
}

export const userDbs: ForeignDbs = {}

export const registerDb = (name: string, idb: IDBDatabase) => {
    userDbs[name] = idb
}

