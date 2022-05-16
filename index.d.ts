import * as setUp from './src/setUp';
import * as loop_ from './src/loop';
import * as hooks_ from './src/hooks';
import * as store_ from './src/lib/store';
export { cache, match, program } from './src/commands';
export default setUp;
export declare const hooks: typeof hooks_;
export { AppOptions, Action, AppArgv, AppArguments, Module, UserArgs } from './src/appTypes';
export { repl } from './src/setUp';
export { get, post, QueryParams, SaveRequest } from './src/lib/api/call';
export declare const loop: typeof loop_;
export declare const store: typeof store_;
export declare const isNode: Function;
export * from './src/lib/input/server';
interface RenewReader {
    (arg1: string, arg2: ReadlineInterface): Promise<ReadlineInterface>;
    default?: RenewReader;
}
declare type Deps = {
    'fs'?: Promise<{
        default?: any;
        writeFileSync: Function;
        readFileSync: Function;
    }>;
    'shelljs'?: Promise<{
        default?: any;
        mkdir: Function;
    }>;
    'readline'?: Promise<Readline>;
    'historyListener'?: Promise<{
        default: any;
        on: Function;
    }>;
    'terminalUtils'?: Promise<{
        default?: {
            matchUp: (arg1: any) => boolean;
            matchDown: (arg1: any) => boolean;
            eventName: string;
            clearCurrent: (arg1: any) => void;
        };
        matchUp: (arg1: any) => boolean;
        matchDown: (arg1: any) => boolean;
        eventName: string;
        clearCurrent: (arg1: any) => void;
    }>;
    'renewReader'?: Promise<RenewReader>;
};
interface ReadlineInterface {
    question: Function;
    write: Function;
    close: Function;
    line: string;
}
export declare type Readline = {
    default?: Readline;
    createInterface: (arg: {
        input: any;
        output: any;
        prompt: any;
    }) => ReadlineInterface;
    utils?: {
        matchUp: Function;
        matchDown: Function;
        eventName: string;
    };
    getInput?: (arg1: string, arg2?: string) => Promise<string>;
};
declare type DepName = 'fs' | 'shelljs' | 'readline' | 'historyListener' | 'terminalUtils' | 'renewReader';
declare type Awaitable = <DN extends keyof Deps>(dn: DN) => Promise<Deps[typeof dn]>;
export declare const deps: {
    get: Awaitable;
    set: <D extends DepName>(depName: D, newDep: Deps[D]) => void;
};
