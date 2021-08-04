import "fake-indexeddb/auto";
import { Dexie } from 'dexie'

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
    names: Array<string>
    commands: Array<string>
    value: any
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
            cache: 'names, command, value'
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

// example of how to cache
/*
export const cacheBrax = async (text_brackets: [string, string], clitext: string, dat: { brackets: string, [key: string]: any }) => {

    return db.bracketsget.put({ text_brackets, text: text_brackets[0], clitext, data: dat });

}
*/

/**
Caching per command.

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
