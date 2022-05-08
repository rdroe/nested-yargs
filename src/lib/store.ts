import "fake-indexeddb/auto";
import { Dexie } from 'dexie'
import stringArgv from 'string-argv'

const jq = {
    run: (a: any, b: any, c: any) => {
        return JSON.stringify({ spoofed: 'data' })
    }
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

const db = new UiDb();

export default db

export interface Query {
    id?: number
    commands: string[] | '*'
    names: string[] | '*'
    _jq?: string // on entry, _jq limits results to this dot path, etc if present
}

export interface Entry extends Query {
    value: any
    // if _jq is present, only the dot-path will be entered.
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
    _jq: string | null
}

// For parseing {asdf`asdf`asdf} to a query to run on db
const cacheInstructionsToQuery = (inner: string | null, defaultQuery: string | null): CacheQuery => {

    if (inner === null) return { commands: [], names: [], _jq: null }
    const split = inner.split('`')
    switch (split.length) {
        case 1:
            const cmds = chooseCommands(split[0])
            return {
                commands: cmds,
                names: [],
                _jq: defaultQuery
            }

        case 2:
            const cmds2 = chooseCommands(split[0])

            const names2 = chooseCommands(split[1])
            return {
                commands: cmds2,
                names: names2,
                _jq: defaultQuery
            }

        case 3:
            const cmds3 = chooseCommands(split[0])
            const names3 = chooseCommands(split[1])
            const jq3 = split[2]
            return {
                commands: cmds3,
                names: names3,
                _jq: jq3 ?? defaultQuery
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

const interpretQueryAsLodash = async (filter: string, res1: Cache[]): Promise<JsonQueryInterpretation> => {
    const lowerFilter = filter.toLowerCase()
    if (lowerFilter === 'first' || lowerFilter === 'f') {
        return res1[0]
    } else if (lowerFilter === 'last' || lowerFilter === 'l') {
        return res1[res1.length - 1]
    } else return null
}

const interpretQuery = async (query: CacheQuery): Promise<JsonQueryInterpretation> => {

    const {
        commands = [], names = [], _jq: filter = null
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
            return jqEval(res1, filter)
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

    const strArgv = stringArgv(cli)
    let hasFoundOption = false
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

export const jqEval = async (obj: object, query: string | undefined
    | null) => {

    if (typeof query !== 'string') return obj

    // disallow non-object ...
    if (typeof obj !== 'object') {
        // except if identity.
        if (query === '.') return obj
    }

    const str = await jq.run(query, obj, { input: 'json' })
    return JSON.parse(str)
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

        const { commands, names, _jq, value: valueIn } = entry
        const value = await jqEval(valueIn, _jq)
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

export const cache = async (commands: string[], data: any, names: string[] = [], _jq: string | undefined = undefined) => {
    put({ commands, names, value: data, _jq })
}

const anyIsNull = (c: string[] | '*') => {
    return c !== '*' && c.filter(c1 => c1 === null).length > 0
}
export const where = async (query: Query) => {

    if (anyIsNull(query.commands || [])) throw new Error('Null disallowed in commands[] query argument')
    const { _jq } = query
    let rawResult: Cache[] = []
    if (typeof query.id === 'number' && query.id !== -1) {
        rawResult = await db.cache.where({ id: query.id }).toArray()
        return jqEval(rawResult, _jq || null)
    } else {

        return interpretQuery({
            ...query,
            commands: query.commands ?? '*',
            names: query.names ?? '*',
            _jq: query._jq || null
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
