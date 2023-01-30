// only import this after indexed db has been imported.
// it may be fake-indexeddb, so we can't spoilt it ahead of time.
import { FakeCli } from 'browser/exports'
import { getSingleton } from 'shared/utils/singletons'
import { get, getConfig } from '../shared'
export { getConfig }
export { destructureSwipl } from '../shared/utils/swiplAdaptors'
export * as dbUtils from './cache'
export * as store from './store'
export * as queue from '../shared/utils/queue'
export * as call from '../shared/api/call'
export * as idbUtils from '../shared/idb-backup-and-restore'
export { addListener } from './input'
export * as scanners from './scanners/index'
export const getDb = async () => get('db')
export const getFs = async () => get('fs')

export const fakeCli: { handle: FakeCli['handle'] } = {
    handle: (str: string) => {
        const fcli = getSingleton<FakeCli>('fakeCli')

        return fcli.default.handle(str)
    }
}


