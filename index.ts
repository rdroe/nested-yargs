import setUp from './src/setUp'
import * as loop_ from './src/loop'
import * as hooks_ from './src/hooks'
import cache_ from './src/commands/cache'
import * as store_ from './src/lib/store'
console.log('store_', Object.keys(store_))
export const cache = cache_
export default setUp
export const hooks = hooks_
import { AppArguments } from './src/appTypes'
export { AppOptions, Action, AppArgv, AppArguments, Module } from './src/appTypes'
export { repl } from './src/setUp'
export { get, post, QueryParams, SaveRequest } from './src/lib/api/call'
export const loop = loop_
export const store = store_
import { Arguments } from 'yargs'
require('source-map-support').install();

export type UserArgs<T = {}> = AppArguments & Arguments<T> & {
    /** Non-option arguments */
    _: Array<string | number>;
    /** The script name or node command */
    $0: string;
    /** All remaining options */
    [argName: string]: unknown;
};
