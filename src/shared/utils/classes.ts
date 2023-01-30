import { Dexie as DexieCore, DexieOptions } from 'dexie'
import { OptionalIndexes } from './types'
import * as fidb from 'fake-indexeddb'
class NyargsDb extends DexieCore {
    public constructor(tableName: string, options: DexieOptions = {}) {
        super(tableName, options)
    }
}

export class UserTablesDb extends NyargsDb {
    public userTables: DexieCore.Table<{
        id?: number,
        table: string,
        data: { [key: string]: any },
        createdAt: number
    } & OptionalIndexes>
    public constructor() {

        super("UserTablesDb", { indexedDB: fidb.indexedDB, IDBKeyRange: fidb.IDBKeyRange })
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
