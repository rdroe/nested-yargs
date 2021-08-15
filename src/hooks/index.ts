import { AppArgv } from '../appTypes'
import db from '../lib/store'

const jq = require('node-jq')

export const context: {
    [props: string]: null | Function | Promise<any>
} = {
    currentPromise: null,
    currentResolve: null
}

const hooks: {
    [hookName: string]: Function
} = {

    resolver: null
}

export const cache = async (argv: AppArgv, data: any) => {

    if (argv && argv.c !== undefined && data && typeof data === 'object') {

        if (typeof argv.c === 'string') {
            console.log('jq running ', argv.c, ' on ', data)
            const filtered = await jq.run(argv.c, data, { input: 'json' })

            console.log('would have cached', typeof filtered, filtered)

            return filtered
        }
    }
}

export default hooks

export const add = (name: string, hook: Function) => {
    hooks[name] = hook
}


