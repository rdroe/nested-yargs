import './deps'
import '../tests'
import * as stores from '../runtime/store'
export const store = stores
import programCmd from '../commands/program'
export const program = programCmd
import matchCmd from '../commands/match'
export const match = matchCmd
import elementCmd from '../commands/element'

import test_ from '../commands/_tools/test'
export const test = test_

export const element = elementCmd
import cacheCmd from '../commands/cache'

export const cache = cacheCmd
import nestCmd from '../commands/nest'
export const nest = nestCmd
import { repl as repl_ } from '../runtime/setUp'
export const repl = repl_

export { configure } from '../shared/index'

export { setDictionary } from '../shared/utils/queue'


// fetch utils
export { get, post } from '../shared/api/call'

// rb exports
export { get as getDeps } from '../shared'
export { put, Entry } from '../runtime/store'
export { dbPath } from '../shared/utils/dbPath'
export { default as isNode } from '../shared/utils/isNode'
export { importFromJson, clearDatabase, exportToJson } from '../shared/idb-backup-and-restore'
import * as dbHelpers from '../runtime/cache'

export const dbUtils = dbHelpers
export * as init from './init'

export * from '../shared/utils/types'

