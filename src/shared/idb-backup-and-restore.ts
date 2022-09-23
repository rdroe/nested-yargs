
/**
 * Export all data from an IndexedDB database
 *
 * @param {IDBDatabase} idbDatabase The database to export from
 * @return {Promise<string>}
 */
export function exportToJson(idbDatabase: IDBDatabase): Promise<string> {
    return new Promise((resolve, reject) => {
        const exportObject: { [str: string]: any } = {}
        if (idbDatabase.objectStoreNames.length === 0) {
            resolve(JSON.stringify(exportObject, null, 2))
        } else {
            const list = (idbDatabase.objectStoreNames as unknown) as string[]
            const transaction = idbDatabase.transaction(
                list,
                'readonly'
            )

            transaction.addEventListener('error', reject)

            for (const storeName of list) {
                const allObjects: any[] = [];
                (transaction as any)
                    .objectStore(storeName)
                    .openCursor()
                    .addEventListener('success', (event: EventTarget) => {
                        const cursor = (event as any).target.result
                        if (cursor) {
                            // Cursor holds value, put it into store data
                            allObjects.push(cursor.value)
                            cursor.continue()
                        } else {
                            // No more values, store is done
                            exportObject[storeName] = allObjects
                            // Last store was handled
                            if (
                                idbDatabase.objectStoreNames.length ===
                                Object.keys(exportObject).length
                            ) {
                                resolve(JSON.stringify(exportObject, null, 2))
                            }
                        }
                    })
            }
        }
    })
}


/**
 * Import data from JSON into an IndexedDB database.
 * This does not delete any existing data from the database, so keys may clash.
 *
 * @param {IDBDatabase} idbDatabase Database to import into
 * @param {string}      json        Data to import, one key per object store
 * @return {Promise<void>}
 */
export function importFromJson(idbDatabase: IDBDatabase, json: any) {
    return new Promise<void>((resolve, reject) => {
        if (!idbDatabase) return resolve()
        const list = (idbDatabase.objectStoreNames as unknown) as string[]
        const transaction = idbDatabase.transaction(
            list,
            'readwrite'
        )
        transaction.addEventListener('error', reject)
        var importObject = JSON.parse(json)
        for (const storeName of list) {
            let count = 0
            if (importObject[storeName] === undefined) {
                continue
            }
            if (importObject[storeName].length === 0) {
                delete importObject[storeName]
                continue
            }
            for (const toAdd of importObject[storeName]) {
                const request = transaction.objectStore(storeName).put(toAdd)
                request.addEventListener('success', () => {
                    count++
                    if (count === importObject[storeName].length) {
                        delete importObject[storeName]
                        if (Object.keys(importObject).length === 0) {
                            resolve()
                        }
                    }
                })
            }
        }
    })
}

/**
 * Clear a database
 *
 * @param {IDBDatabase} idbDatabase The database to delete all data from
 * @return {Promise<void>}
 */
export function clearDatabase(idbDatabase: IDBDatabase) {
    return new Promise<void>((resolve, reject) => {
        if (!idbDatabase) return resolve()
        if (typeof idbDatabase.objectStoreNames !== 'object') {
            throw new Error('an array is required')
        }
        const list = (idbDatabase.objectStoreNames as unknown) as string[]
        const transaction = idbDatabase.transaction(
            list,
            'readwrite'
        )

        transaction.addEventListener('error', reject)

        let count = 0
        for (const storeName of list) {
            transaction
                .objectStore(storeName)
                .clear()
                .addEventListener('success', () => {
                    count++
                    if (count === idbDatabase.objectStoreNames.length) {
                        // Cleared all object stores
                        resolve()
                    }
                })
        }
    })
}
