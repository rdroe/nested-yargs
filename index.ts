import * as setUp from './src/setUp'
import * as loop_ from './src/loop'
import * as hooks_ from './src/hooks'
import * as store_ from './src/lib/store'

export { cache, match, program } from './src/commands'

export default setUp
export const hooks = hooks_
export { AppOptions, Action, AppArgv, AppArguments, Module, UserArgs } from './src/appTypes'


export { repl } from './src/setUp'
export { get, post, QueryParams, SaveRequest } from './src/lib/api/call'
export const loop = loop_
export const store = store_

export const isNode = new Function("try {return this===global;}catch(e){return false;}")


const depsRef: Deps = {
} = {}

if (isNode()) {
    import('source-map-support').then(({ default: sms }) => sms.install());
}



type Deps = {
    'fs'?: Promise<{
        default?: any
        writeFileSync: Function,
        readFileSync: Function
    }>,
    'shelljs'?: Promise<{
        default?: any
        mkdir: Function
    }>
}

type DepName = 'fs' | 'shelljs'

type Awaitable = <DN extends keyof Deps>(dn: DN) => Promise<Deps[typeof dn]>

const getDeps: Awaitable = async (dn: DepName) => {
    if (!depsRef[dn]) throw new Error()
    return depsRef[dn].then((resolvedDep) => {
        if (resolvedDep.default) return resolvedDep.default
        return resolvedDep
    })
}

export const deps = ({
    get: getDeps,
    set: <D extends DepName>(depName: D, newDep: Deps[D]) => {
        depsRef[depName] = newDep
    }
})
