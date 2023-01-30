import { isNumber } from '../utils/validation'
import { Module, ModuleFn, ModuleHelp } from '../utils/types'

type ModuleHelper = <T = {}, R = null>(name: string, fn: ModuleFn<T, R>, helpArg: string | ModuleHelp, submodules?: [string, Module][]) => {
    [nm: string]: Module<Parameters<typeof fn>[0]>
}

export const isString = (arg: any): arg is string => {
    return typeof arg === 'string'
}

export const isStringNumNum = (arr: any[]): arr is [string, number, number] => {
    if (arr.length !== 3) return false
    const [a, b, c] = arr
    return isString(a) && isNumber(b) && isNumber(c)
}

export const makeModule: ModuleHelper = (
    name,
    fn,
    help = { 'description': `Do "${name}" (needs documentation)`, examples: { "": "(Also needs examples)" } }, submodules: ReturnType<typeof makeSubmodule>[] = []) => {
    type T = Parameters<typeof fn>[0]
    const module: Module<T> = {
        help: isString(help) ? { description: help } : help,
        fn
    }
    if (submodules.length) {
        module.submodules = Object.fromEntries(submodules)
    }
    return { [name]: module }
}

export const makeSubmodule = <T = {}, R = {}>(name: string, fn: ModuleFn<T, R>, help?: string | ModuleHelp, submodules: [string, Module][] = []) => {
    const module = makeModule(name, fn, help, submodules)
    return [name, module[name]] as [n: string, m: Module]
}

const fn1: ModuleFn<{ testarg: string }, null> = (args) => null
const m1 = makeModule('typetest', fn1, "do nothing")


export const collapseBlanks = (str: string) => {
    return str.replace(/\s+/g, ' ').trim()
}

export const partialJsonString: (arg: any, len?: number) => string = (arg, len = 150) => {
    return JSON.stringify(arg, null, 2).substring(0, len)
}

const isProm = (arg1: any): boolean => {
    if (arg1 === null) return false
    if (arg1 === undefined) return false
    if (typeof arg1 === 'function') return false
    const isFunc = (propVal: any): boolean => typeof propVal === 'function'
    return ['catch', 'finally', 'then'].reduce((tOrF: boolean, fnName: string) => {

        if (tOrF === false) { return false }

        return arg1[fnName] !== undefined && isFunc(arg1[fnName])
    }, true)
}

/**
   Passed an object with mixed Promisory and non-promisory values, await all of the promisory ones and return an object in which each property is its own awaited value.
*/
export async function awaitAll<T = any>(allProperties: {
    [numOrString: string]: any,
}): Promise<T> {

    let props: string[] = []
    let vals: Promise<any>[] = []
    Object.entries(allProperties).forEach(([p, v]) => {
        if (isProm(v)) {
            vals.push(v)
        } else {
            vals.push(Promise.resolve(v))
        }
        props.push(p)
    })

    const completions = await Promise.all(vals)

    const cb = (accum: T, prop: any, idx: number) => {
        return { ...accum, [prop]: completions[idx] }
    }

    return props.reduce(cb, {} as T)
}

export type ValType<M> = M extends Map<any, infer V> ? V : never
export type KeyType<M> = M extends Map<infer K, any> ? K : never

type Reducible = { [prop: string]: any }

type AnyObj = { [objKey: string]: any }
export const rewriteObject = (obj: AnyObj, kvFn: ([k, v]: [any, any]) => [retKey: any, retVal: any]) => {
    const ret: AnyObj = {}
    Object.entries(obj).forEach(([k, v]) => {
        const newEntry = kvFn([k, v])
        ret[newEntry[0]] = newEntry[1]
    })
    return ret
}

export const reduceObject = <T = Reducible>(obj: T, fn: (v?: any, k?: keyof T) => any, opts = { interpretEntries: true }) => {

    const ret = {}
    return Object.entries(obj).reduce((accum: T, curr: [string, keyof typeof accum]) => {
        const newVal: any = fn(curr[1], curr[0] as keyof typeof accum)
        if (newVal === undefined) return accum
        if (opts.interpretEntries) {
            if (Array.isArray(newVal) && newVal.length === 2) {
                if (['number', 'string'].includes(typeof newVal[0])) {
                    if (accum[`${newVal[0]}` as keyof typeof accum] !== undefined) throw new Error(`While reducing object, interpreting entry-like return of iterator, a non-unique element was found. key: ${newVal[0]}; accumulator: ${accum}`)
                    return {
                        ...accum, [`${newVal[0]}`]: newVal[1]
                    }
                }
            }
        }
        return {
            ...accum,
            [curr[0]]: newVal
        }
    }, ret as Partial<T>)
}

export function tightenWhitespace(str: string): string {
    return str.replace(/\#(.)+/g, '\n')
        .replace(/[\s\t\n]+/g, ' ')
        .replace(/[\s\t\n]*\./g, '.')
        .replace(/\.[\s\t\n]*/g, '.')
        .replace(/\:[\s\t\n]*/g, ':')
        .replace(/[\s\t\n]*\:/g, ' :')
        .replace(/[\s\t\n]*\)/g, ')')
        .replace(/[\s\t\n]*\(/g, '(')
        .replace(/\)[\s\t\n]*/g, ')')
        .replace(/\([\s\t\n]*/g, '(')
        .replace(/\)/g, ') ')
        .replace(/[\s\t\n]*\./g, '.')
        .replace(/\#(.)+/g, '\n')
}



export const secondContainsFirst = (arr1: any[], arr2: any[]) => {
    if (arr2.length < arr1.length) { return false }
    const notInTwo = arr1.find(
        (arrOneVal => !arr2.includes(arrOneVal))
    )
    const allPresent = notInTwo === undefined
    return allPresent
}

export const isEmptyObject = (obj: object): boolean => {
    return JSON.stringify(obj) === '{}'
}

// stringify any object
export const satv = (...arg: any[]) => {
    return arg.map(anArg => JSON.stringify(anArg, null, 2))
}

// log any object
export const latv = (...arg: any[]) => {
    console.log(satv(...arg))
}


export const tailOrNull = <T = any>(arr?: T[] | null): T | null => {
    if (!arr) return null
    if (!arr.length) return null
    return arr[arr.length - 1]
}

export const anyIs = (val: any, arg: any[]) => {
    if (val === undefined) throw new Error(`Cannot pass undefined to anyIs()`)

    const found = arg.find((elem: any) => {
        return elem === val
    }) !== undefined

    return found
}
