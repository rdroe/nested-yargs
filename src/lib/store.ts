import "fake-indexeddb/auto";
import { Dexie } from 'dexie'
import stringArgv from 'string-argv'

const jq = require('node-jq')

interface TimeTree {
    id?: number;
}

interface SubTree {
    id?: number;
}

interface RbNode {
    id: string;
    text: string;
}

interface Vars {
    one?: string
    two?: [string, string]
    value: any
}

interface Cache {
    id?: number
    names: Array<string>
    commands: Array<string>
    value: any
    createdAt: number
}

class UiDb extends Dexie {
    public timetree: Dexie.Table<TimeTree, number>
    public subtree: Dexie.Table<SubTree, number>
    public rbnode: Dexie.Table<RbNode, string>
    public vars: Dexie.Table<Vars, string>
    public cache: Dexie.Table<Cache, string>
    public constructor() {
        super("UiDb")
        this.version(1).stores({
            timetree: "id++",
            subtree: "id++",
            rbnode: "id,text",
            vars: 'one, two',
            cache: 'id++, *names, *commands, value, [commands+names], createdAt'
        });
        this.timetree = this.table("timetree")
        this.subtree = this.table("subtree")
        this.rbnode = this.table("rbnode")
        this.vars = this.table('vars')
        this.cache = this.table('cache')
    }
}

const db = new UiDb();
export default db


export interface Query {
    id?: number
    commands: string[]
    names: string[]
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
    commands: string[]
    names: string[]
    _jq: string | null
}

// For parseing {asdf`asdf`asdf} to a query to run on db
const cacheInstructionsToQuery = (inner: string | null, initCmds: string[], defaultQuery: string | null): CacheQuery => {

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

    const splitOne = str.split('{')
    if (splitOne.length === 1) {
        return { cli: str, brackets: null, bracketed: null }
    }
    const [leftOuter, rightOfBrackOne] = splitOne
    splitTwo = rightOfBrackOne.split('}')
    if (splitTwo.length === 1) {
        throw new Error('invalid cache instructions: ' + str)
    }

    const [inner, rightOuter] = splitTwo
    return { cli: `${leftOuter} ${rightOuter}`, brackets: inner ?? null, bracketed: inner ? `{${inner}}` : null }

}


/**
 Prove that a cache result's index at indexName (e.g. commands or names)  matches (starts with) each target in order.
*/
const filterResult = (result: Cache, targets: string[], indexName: 'commands' | 'names') => {
    // commands var is the input from first `-separated section. (array of strings at this point) minuse the first one, which we know already matches at this point.
    // result is a cache entry, so result.commands is the commands index originally stored with it.  
    if (!targets.length) return true

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

const queryArrayIndex = async (targets: string[], indexName: 'commands' | 'names'): Promise<Cache[]> => {
    const first = targets.shift()
    const q = db.cache
    const res = await q.where(indexName)
        .startsWith(first)
        .and((possResult) => {
            return filterResult(possResult, [first, ...targets], indexName)
        })
        .toArray()
    res.sort((a, b) => {
        if (a.createdAt > b.createdAt) return 1
        else if (a.createdAt < b.createdAt) return -1
        return 0
    })
    return res
}

const filterOnArrayIndex = async (arr: Cache[], targets: string[], targetName: 'commands' | 'names') => {

    return arr.filter(possResult => filterResult(possResult, targets, targetName))
}

const interpretQuery = async (query: CacheQuery): Promise<Cache[] | Cache | string> => {

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
        console.log('no commands present! names')
    }

    if (res1.length === 0) return res1

    if (filter !== null) {
        console.log('filter passed:', filter)
        const lowerFilter = filter.toLowerCase()
        if (lowerFilter === 'first' || lowerFilter === 'f') {
            return res1[0]
        } else if (lowerFilter === 'last' || lowerFilter === 'l') {
            return res1[res1.length - 1]
        } else {
            return jqEval(res1, filter)
        }
    }
    return res1
}

export const parseCacheInstructions = async (str: string, defaultFilter: string | null = null) => {

    const { cli, brackets, bracketed } = extractBracketedSections_(str)
    requireValidCacheInstructions(str)
    if (cli.includes('{') || cli.includes('}')) {
        throw new Error('Only one set of cache instructions is allowed for now.')
    }

    const strArgv = stringArgv(cli)
    let hasFoundOption = false

    const initCmds = strArgv.filter(cmd => {
        const charAt0 = cmd.charAt(0)
        hasFoundOption = hasFoundOption ? true : (charAt0 === '-')
        return hasFoundOption === false
    })

    const query = cacheInstructionsToQuery(brackets, initCmds, defaultFilter)
    const res = await interpretQuery(query)
    const strPatch = typeof res === 'object' ? JSON.stringify(res) : res
    return str.replace(bracketed, strPatch)
}

export const jqEval = async (obj: any, query: string | undefined) => {
    if (query === undefined) return obj
    const str = await jq.run(query, obj, { input: 'json' })
    return JSON.parse(str)
}

export const put = async (entry: Entry) => {

    try {
        const { commands, names, _jq, value: valueIn } = entry
        const value = await jqEval(valueIn, _jq)
        const createdAt = Date.now()
        console.log('putting', value, ' at ', commands, names)
        return db.cache.put({ commands, names, value, createdAt })

    } catch (e) {
        console.error('Could not put new entry: ' + entry)
    }
}

export const cache = async (commands: string[], data: any, names: string[] = [], _jq: string | undefined = undefined) => {
    put({ commands, names, value: data, _jq })
}

export const where = async (query: Query) => {
    const { _jq } = query
    const q_ = Object.entries(query).reduce((accum, [key, val]) => {
        if (val && key !== '_jq') {
            return { ...accum, [key]: val }
        }
        return accum
    }, {})
    console.log('jq:', _jq)
    const raw = await db.cache.where(q_).toArray()
    const arr = Object.values(raw)
    console.log('arr', arr, ' jq:', _jq)
    const filtered = await jqEval(arr, _jq)
    console.log('filt', filtered)
    return filtered
}
/**
Caching per command.
[Revamp all of this to use jq syntax]
command is fed in automatically. the cache value always follows '-c' and will look like

-c foo.1.bar:varname1,varname2

In the json that comes back with this data, we'll drill down in the response to the dot path.

whatever the value is at that locale will be stores as

{
  names: [varname1, varname2]
  commands: [command1, command2]
  value: CAPTURED VALUE FROM DOTPATH
}

the multiple "varnames" just make for a deeper namespace.

---Retrieval---- (draft 2)

see below for the first version to make sense of this one.

don't forget to timestamp cache
don't forget to replace vars with the below cache read cmd

-c arguments
  - a utility called by all command modules
  - job is to get the  coming output into the store  - cahe puts are always namespaced at least to the commands. also, you can add namespace names.
  - arguments are (1) user-chosen namespaces and (2) drill-down for a specific output property.
  - this utility looks at all commands, seeking for -c args to analyze and cache-put

braceInterpretor
  - another syntax is used for accessing the cache.
  - it combines user-namespaced, command-namespaced prop names, and also the jq syntax (jq-node)

cache read
  - its own command callable by user
  - uses braceInterpretor to search the cache

cache pipe
  - utility that is hooked into all arguments of all commands, potentially
  - when it runs, it adds an approval stage to cli entries: "is this the expanded command you want to run?"
  - a hook that runs before all yargs calls: uses braceInterpretor to replace brace syntax back to literal from cache lookup.





---Retrieval---- (draft 1)

to insert, as if to push a save to the database, you can use --cao (cache-out)

all options with values are run through the cao processor. the cao processor is active if an input value begins with '{'

suppose brackets save -v {|varname1,varname2} -d storyteller

this would look up all of the data at those namespaces (any command). it would take the most recent and pop it into place as that variable value.

suppose brackets save -v {brackets,get|varname1} -d storyteller

it would only look within the brackets get commands namespace for that name.

suppose brackets save -v {brackets} -d storyteller

this (notice no pipe) would bet the most recent from the brackets namespace

suppose brackets save -v {brackets,get|varname1|1} -d storyteller

this would get the next-to-most-recent in that namespace command-space combo.

suppose brackets save -v {brackets,get||2|foo.bar} -d storyteller

would get the third most recent in that command namespace (no varnames)

supposing brackets save -v {||0|foo.bar -d storyteller

would look up foo.bar in the previous result. notice this is because namespaces (command and user-chosen) are all omitted.


new code modules to be written:

(rid vars command)

lookUpBrackets
  - convert the '{...}' to a lookup

cache read ( a new command )
  - to also use lookUpBrackets -- a command to directly test bracket notation for user

cachePerInstruction
  - interpret '-c' values to become cache instructions.

other todo:
  - always cache everything in at least its command-based namespace
  - impose a timestamp on the cache store


 */
