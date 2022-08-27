import './deps'
import '../tests'

import * as stores from '../runtime/store'
export const store = stores
import programCmd from '../commands/program'
export const program = programCmd
import matchCmd from '../commands/match'
export const match = matchCmd
import cacheCmd from '../commands/cache'
export const cache = cacheCmd

import test_ from '../commands/_tools/test'
export const test = test_
import { repl as repl_ } from '../runtime/setUp'
export const repl = repl_
import nestCmd from '../commands/nest'
export const nest = nestCmd
export { configure } from '../shared/index'

export { Result } from '../shared/utils/types'
export { setDictionary } from '../shared/utils/queue'

