import setUp from './src/setUp'
import * as loop_ from './src/loop'
import * as hooks_ from './src/hooks'
import cache_ from './src/commands/cache'
import * as store_ from './src/lib/store'

export const cache = cache_
export default setUp
export const hooks = hooks_
export { AppOptions, Action, AppArgv, AppArguments, Module, UserArgs } from './src/appTypes'

export { repl } from './src/setUp'
export { get, post, QueryParams, SaveRequest } from './src/lib/api/call'
export const loop = loop_
export const store = store_

require('source-map-support').install();
