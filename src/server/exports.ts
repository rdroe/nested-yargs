import './deps'
import '../tests'

import * as stores from '../runtime/store'
export const store = stores

import programCmd from '../commands/program'
export const program = programCmd

import matchCmd from '../commands/match'
export const match = matchCmd

import elementCmd from '../commands/element'
export const element = elementCmd

import cacheCmd from '../commands/cache'
export const cache = cacheCmd

import test_ from '../commands/_tools/test'
export const test = test_

import lastCmd from '../commands/last'
export const last = lastCmd

import { repl as repl_ } from '../runtime/setUp'
export const repl = repl_

import nestCmd from '../commands/nest'
export const nest = nestCmd

export { configure } from '../shared/index'

// fetch utils
export { get, post } from '../shared/api/call'

export { setDictionary } from '../shared/utils/queue'

// rb exports
export { get as getDeps } from '../shared'
export { put, Entry } from '../runtime/store'
export { dbPath } from '../shared/utils/dbPath'
export { default as isNode } from '../shared/utils/isNode'
export { importFromJson, clearDatabase, exportToJson } from '../shared/idb-backup-and-restore'
import * as dbHelpers from '../runtime/cache'
export const dbUtils = dbHelpers
