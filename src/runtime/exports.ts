// only import this after indexed db has been imported.
// it may be fake-indexeddb, so we can't spoilt it ahead of time.
import { get, getConfig } from '../shared'
export { getConfig }
export { destructureSwipl } from '../shared/utils/swiplAdaptors'
export * as dbUtils from './cache'
export * as store from './store'
export * as queue from '../shared/utils/queue'
export * as call from '../shared/api/call'
export * as idbUtils from '../shared/idb-backup-and-restore'
export { fakeCli } from './input'
export const getDb = async () => get('db')
export const getFs = async () => get('fs')

