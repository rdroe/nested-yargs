
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
export { Result } from '../shared/utils/types'

export { setDictionary } from '../shared/utils/queue'
