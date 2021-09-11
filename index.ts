import setUp from './src/setUp'
import * as hooks_ from './src/hooks'
import cache_ from './src/commands/cache'
export const cache = cache_
export default setUp
export const hooks = hooks_
import { AppArguments } from './src/appTypes'
export { AppOptions, Action, AppArgv, AppArguments } from './src/appTypes'
export { repl } from './src/setUp'
export { get, post, QueryParams, SaveRequest } from './src/lib/api/call'

import { Arguments } from 'yargs'

export type UserArgs<T = {}> = AppArguments & Arguments<T> & {
    /** Non-option arguments */
    _: Array<string | number>;
    /** The script name or node command */
    $0: string;
    /** All remaining options */
    [argName: string]: unknown;
};
