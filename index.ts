import setUp from './src/setUp'
import hooks_ from './src/hooks'
import vars from './src/commands/vars'
export default setUp
export const hooks = hooks_
import { AppArguments } from './src/appTypes'
export { AppOptions, Action, AppArgv, AppArguments } from './src/appTypes'
export { repl } from './src/setUp'
export { get, post, QueryParams, SaveRequest } from './src/lib/api/call'
export const cache = vars
import { Arguments } from 'yargs'

export type UserArgs<T = {}> = AppArguments & Arguments<T> & {
    /** Non-option arguments */
    _: Array<string | number>;
    /** The script name or node command */
    $0: string;
    /** All remaining options */
    [argName: string]: unknown;
};
