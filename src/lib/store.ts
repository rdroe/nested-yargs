
// @ts-ignore
import getProperty from 'dotprop'
// import 'fake-indexeddb/auto'
import { Dexie, DexieOptions } from 'dexie'


export const FILTER_ARG = 'filters'

const postDotPropFns = Object.keys(Object.getOwnPropertyDescriptors(Array.prototype))

type PostDotPropFns = keyof typeof Array.prototype


type FunctionCall = {
    fnName: PostDotPropFns,
    args: (string | number)[]
}

const isValidFunctionCall = (fnCall: any): fnCall is FunctionCall => {
    if (fnCall === null) return false
    if (typeof fnCall.fnName !== 'string' || fnCall.fnName.length === 0) return false
    if (!Array.prototype[fnCall.fnName]) return false
    return true
}

const isNum = (val: string) => /^\d+$/.test(val);

interface DotpropString {
    string: string
    validWith: object | null | '?'
}

const isValidDotprop = (obj: any): obj is DotpropString => {

    if (typeof obj !== 'object') return false
    if (typeof obj.string !== 'string' || obj.string.length === 0) return false
    if ((typeof obj.validWith !== 'object') && obj.validWith !== '?') return false

    return true
}

const parseDotprop = (str: string): DotpropString => {
    return {
        string: str.trim(),
        validWith: '?'
    }
}

const simpleParseFnCall = (str: string) => {
    const regExpStr = `(${postDotPropFns.join('|')})\\(([0-9]+)(?:,\s*([0-9]+)|)\\)`
    const regexp = new RegExp(regExpStr);


    const matched = str.match(regexp)

    if (matched === null || !matched.filter) return null

    const result = matched
        .filter((elem) => elem !== undefined)

    const result2 = result.map((elem) => {
        return isNum(elem) ? parseInt(elem) : elem
    })


    result2.shift()
    const parsedCall = {
        fnName: result2.shift(),
        args: result2
    }

    return parsedCall
}

const parseFnOrDotprop = (str: string): FunctionCall | DotpropString => {
    const parsedCall = simpleParseFnCall(str)
    if (isValidFunctionCall(parsedCall)) {
        return parsedCall
    }
    const parsedDotprop = parseDotprop(str)
    if (!isValidDotprop(parsedDotprop)) {
        throw new Error(`Query stage is neither a dotprop entry nor a simple array-based function call: "${str}"`)
    }
    return parsedDotprop
}

const parseQuery = (splitted /* raw */: string[]): (FunctionCall | DotpropString)[] => {
    //   const splitted = raw.split(';')

    //  if (!splitted.filter) throw new Error('Could not split on semicolon: ' + raw)
    const cmds = splitted.filter(elem => !!elem)
    return cmds.map(parseFnOrDotprop)
}


const runFilter = (data: object, stages: (FunctionCall | DotpropString)[]): object => {

    return stages.reduce((accum: object, curr: FunctionCall | DotpropString) => {
        let final
        if (isValidDotprop(curr)) {
            final = getProperty(accum, curr.string)
        } else {

            final = (Array.prototype[curr.fnName]).call(accum, ...curr.args)
        }

        return final
    }, data)
}

const BRACKETS = ['{{', '}}']

interface Cache {
    id?: number
    names: Array<string> | '*'
    commands: Array<string> | '*'
    value: any
    createdAt: number
}

export class UiDb extends Dexie {
    public cache: Dexie.Table<Cache>

    public constructor() {
        super("UiDb")
        this.version(1).stores({
            cache: 'id++, *names, *commands, value, [commands+names], createdAt'
        });
        this.cache = this.table('cache')
    }
}

const db = new UiDb;

export default db

export interface Query {
    id?: number
    commands: string[] | '*'
    names: string[] | '*'
    [FILTER_ARG]: string[]
}

export interface Entry extends Query {
    value: any
    // if [FILTER_ARG] is present, only the dot-path will be entered.
}

const requireValidCacheInstructions = (str: string) => {
    const reasons: string[] = []
    const result = [true, reasons]
    if (typeof str !== 'string') {
        reasons.push('invalid type: ' + str + ' is ' + typeof str)
    }
    if (reasons.length) throw new Error(reasons.join('\n'))
    return result
}

export const clearCacheDb = async () => {

    return db.cache.toCollection().delete()
}

const chooseCommands = (explicitCmds: undefined | string) => {
    if (typeof explicitCmds === 'string') {
        return explicitCmds.split(' ').filter(x => x !== '' && x !== ' ')
    } else {
        return []
    }
}

interface CacheQuery {
    commands: string[] | '*'
    names: string[] | '*'
    [FILTER_ARG]: string[] | null
}

// For parseing {asdf`asdf`asdf} to a query to run on db
const cacheInstructionsToQuery = (inner: string | null, defaultQuery: string | null): CacheQuery => {

    if (inner === null) return { commands: [], names: [], [FILTER_ARG]: null }
    const split = inner.split('`')
    switch (split.length) {
        case 1:
            const cmds = chooseCommands(split[0])
            return {
                commands: cmds,
                names: [],
                [FILTER_ARG]: [defaultQuery]
            }

        case 2:
            const cmds2 = chooseCommands(split[0])

            const names2 = chooseCommands(split[1])
            return {
                commands: cmds2,
                names: names2,
                [FILTER_ARG]: [defaultQuery]
            }

        case 3:
            const cmds3 = chooseCommands(split[0])
            const names3 = chooseCommands(split[1])
            const jq3 = split[2].split(' ') // TODO: annotate pipeline thing for cache instructions in readme. splits on ' '
            return {
                commands: cmds3,
                names: names3,
                [FILTER_ARG]: jq3 ? jq3 : [defaultQuery]
            }

        default:
            throw new Error('invalid cache instructions (uncaught)' + inner)
    }
}

const extractBracketedSections_ = (str: string): { cli: string, brackets: string | null, bracketed: string | null } => {

    let splitTwo

    const splitOne = str.split(BRACKETS[0])
    if (splitOne.length === 1) {
        return { cli: str, brackets: null, bracketed: null }
    }
    const [leftOuter, rightOfBrackOne] = splitOne
    splitTwo = rightOfBrackOne.split(BRACKETS[1])
    if (splitTwo.length === 1) {
        throw new Error('invalid cache instructions: ' + str)
    }

    const [inner, rightOuter] = splitTwo
    return { cli: `${leftOuter} ${rightOuter}`, brackets: inner ?? null, bracketed: inner ? `${BRACKETS[0]}${inner}${BRACKETS[1]}` : null }

}


/**
 Prove that a cache result's index at indexName (e.g. commands or names)  matches (starts with) each target in order.
*/
const filterResult = (result: Cache, targets: string[] | '*', indexName: 'commands' | 'names') => {
    // commands var is the input from first `-separated section. (array of strings at this point) minuse the first one, which we know already matches at this point.
    // result is a cache entry, so result.commands is the commands index originally stored with it.  
    if (!targets.length) return true
    if (targets === '*') {
        return true
    }

    const ret = targets.filter((queryCmd, idx) => {
        const test = result[indexName][idx]
        if (test === undefined || queryCmd === undefined) {
            return false
        }
        const tested = test.startsWith(queryCmd)
        return tested
    })

    return ret.length === targets.length

}

const queryArrayIndex = async (targets: string[] | '*', indexName: 'commands' | 'names'): Promise<Cache[]> => {
    const q = db.cache
    let res

    if (targets === '*') {
        res = await q.toArray()
    } else {
        const first = targets.shift()

        res = await q.where(indexName)
            .startsWith(first)
            .and((possResult: Cache) => {
                return filterResult(possResult, [first, ...targets], indexName)
            })
            .toArray()
    }
    res.sort((a: Cache, b: Cache) => {
        if (a.createdAt > b.createdAt) return 1
        else if (a.createdAt < b.createdAt) return -1
        return 0
    })
    return res
}


const filterOnArrayIndex = async (arr: Cache[], targets: string[] | '*', targetName: 'commands' | 'names') => {

    return arr.filter(possResult => filterResult(possResult, targets, targetName))
}
type JsonQueryInterpretation = Cache[] | Cache | string | null

const interpretQueryAsLodash = async (filter: string[], res1: Cache[]): Promise<JsonQueryInterpretation> => {
    if (filter.length !== 1) return null
    const lowerFilter = filter[0].toLowerCase()
    if (lowerFilter === 'first' || lowerFilter === 'f') {
        return res1[0]
    } else if (lowerFilter === 'last' || lowerFilter === 'l') {
        return res1[res1.length - 1]
    } else return null
}

const interpretQuery = async (query: CacheQuery): Promise<JsonQueryInterpretation> => {

    const {
        commands = [], names = [], [FILTER_ARG]: filter = null
    } = query

    let res1: Cache[] = []

    if (commands.length) {

        res1 = await queryArrayIndex(commands, 'commands')
        if (names.length) {
            res1 = await filterOnArrayIndex(res1, names, 'names')
        }

    } else if (names.length) {
        res1 = await queryArrayIndex(names, 'names')
    }

    if (res1.length === 0) return res1

    if (filter !== null) {
        const lodashRes = await interpretQueryAsLodash(filter, res1)

        if (lodashRes !== null) {
            return lodashRes
        } else {
            return evaluateFilter(res1, filter)
        }
    }
    return res1
}

export const parseCacheInstructions = async (str: string, defaultFilter: string | null = null) => {

    const { cli, brackets, bracketed } = extractBracketedSections_(str)

    requireValidCacheInstructions(str)
    if (cli.includes(BRACKETS[0]) || cli.includes(BRACKETS[1])) {
        throw new Error('Only one set of cache instructions is allowed for now.')
    }

    // const strArgv = stringArgv(cli)
    // let hasFoundOption = false

    /*
    const initCmds = strArgv.filter(cmd => {
        const charAt0 = cmd.charAt(0)
        hasFoundOption = hasFoundOption ? true : (charAt0 === '-')
        return hasFoundOption === false
    })
    */

    const query = cacheInstructionsToQuery(brackets, defaultFilter)

    const res = await interpretQuery(query)
    const strPatch = typeof res === 'object' ? JSON.stringify(res) : res

    return str.replace(bracketed, strPatch)
}

export const evaluateFilter = async (obj: object, query: string[] | undefined
    | null) => {


    if (!Array.isArray(query)) return obj

    // except if identity.
    if (query.length === 1 && query[0] === '.') return obj

    const stages = parseQuery(query)
    const result = runFilter(obj, stages)
    if (result === undefined) throw new Error(`Results of the filter "${query}" were undefined`)
    return JSON.parse(JSON.stringify(result))
}

const firstLines = (entry: object) => {
    if (!entry) return '(falsy entry)'
    try {
        return JSON.stringify(entry, null, 2).split('\n').slice(0, 5).join('\n')
    } catch (e) {
        console.error('Could not show json sample!')
        return ''
    }
}


export const put = async (entry: Entry) => {

    let filtered: Cache

    try {

        const { commands, names, [FILTER_ARG]: _jq, value: valueIn } = entry
        const value = await evaluateFilter(valueIn, _jq)
        const createdAt = Date.now()
        const props: Cache = { commands, names, value, createdAt }
        filtered = Object.entries(props)
            .reduce((accum, [key, val]) => {

                if (val !== undefined && val !== null) {
                    return { ...accum, [key]: val }
                }
                return accum
            }, {}) as Cache

        return db.cache.put(filtered)

    } catch (e) {
        const message = `Could not put new entry into uidb.cache.
${firstLines(entry)} ...

internal query data (if we made it that far): 
${firstLines(filtered)}

Db error:
${e.message}
`
        console.error(message)
    }
}

export const cache = async (commands: string[], data: any, names: string[] = [], _jq?: string[]) => {
    put({ commands, names, value: data, [FILTER_ARG]: _jq })
}

const anyIsNull = (c: string[] | '*') => {
    return c !== '*' && c.filter(c1 => c1 === null).length > 0
}

export const where = async (query: Query) => {

    if (anyIsNull(query.commands || [])) throw new Error('Null disallowed in commands[] query argument')
    const { [FILTER_ARG]: _jq } = query
    let rawResult: Cache[] = []
    if (typeof query.id === 'number' && query.id !== -1) {
        rawResult = await db.cache.where({ id: query.id }).toArray()

        return evaluateFilter(rawResult, _jq || null)
    } else {

        return interpretQuery({
            ...query,
            commands: query.commands ?? '*',
            names: query.names ?? '*',
            [FILTER_ARG]: query[FILTER_ARG] || null
        })
    }
}

export const upsertByName = async (unknownDexie: Dexie, tableName: string, name: string) => {
    const dexieDb = unknownDexie as any
    if (dexieDb[tableName] === undefined) throw new Error('table does not exist; ' + tableName)
    const found = await dexieDb[tableName].where({ name }).first()
    if (found) return found
    await dexieDb[tableName].add({ name })
    return dexieDb[tableName].where({ name }).first()
}
