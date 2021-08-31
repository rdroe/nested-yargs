import { AppArguments } from '../../appTypes'
import { Options, CommandModule } from 'yargs'
import { Entry, Query, put, where, jqEval } from '../../lib/store'

const cmds = ['put', 'get', 'eval']

const command: Options = {
    description: 'namespace command to get/put from/to',
    alias: 'c:c',
    type: 'array'
}

const names: Options = {
    description: 'namespace name to get/put from/to',
    alias: 'c:n',
    type: 'array'
}

const jq: Options = {
    description: 'query element to apply in put-able or entry object',
    alias: 'j',
    type: 'string',
    default: '.'
}

const scalar: Options = {
    description: 'value to insert as part of a put entry',
    alias: 'v:s',
    type: 'array',
    default: []
}

const id: Options = {
    description: 'for get, cache element id',
    alias: 'i',
    type: 'number',
    default: -1
}

const object: Options = {
    description: 'value parse-able to json to insert as an object as value of entry',
    alias: 'v:o',
    type: 'array',
    default: []
}

const action = async (argv: AppArguments) => {
    const {
        _: allCommands,
        'c:c': commands,
        'c:n': names,
        scalar,
        object,
        jq: jqQuery
    } = argv

    if ((typeof allCommands === 'number' || typeof allCommands === 'string')) {
        throw new Error('One and only one command is required')
    }
    const [, ...subs] = allCommands
    if (!subs || subs.length !== 1) {
        throw new Error('One and only one command is required')
    }
    const cmd = subs[0]
    const isStringOrNumber = (arg: string | number | (string | number)[]) => {
        if (typeof arg === 'number' || typeof arg === 'string') {
            return true
        }
        return false
    }

    if (isStringOrNumber(commands)) {
        throw new Error('String / number is not allowed; only string[]')
    }

    if (isStringOrNumber(names)) {
        throw new Error('String / number is not allowed; only string[]')
    }

    const arrObject: any[] = []
    if (object.length > 0) {
        object.forEach((json) => {
            const obj = JSON.parse(json)
            arrObject.push(obj)
        })
    }

    if (cmd === 'get') {

        const query: Query = {
            commands: (commands && commands[0] && commands[0] === '*') ? '*' : commands || undefined,
            names: (names && names[0] && names[0] === '*') ? '*' : names || undefined,
            _jq: jqQuery
        }

        if (typeof argv.id === 'number') {
            query.id = argv.id
        }
        argv.result = await where(query)
        return argv
    } else if (cmd === 'put') {

        const result = await Promise.all(
            arrObject
                .concat(scalar ?? [])
                .map((ev) => {

                    const entry: Entry = {
                        commands,
                        names,
                        value: ev,
                        _jq: jqQuery
                    }
                    return put(entry)
                }))
        argv.result = result
        return argv
    } else if (cmd === 'eval') {
        const result = await Promise.all(arrObject.map(async (obj) => {
            await jqEval(obj, jqQuery)
        }))
        argv.result = result
        return argv
    }
}

const cm: CommandModule = {
    command: "cache",
    describe: 'put, get (etc) variables',
    builder: { command, names, jq, scalar, object, id },
    handler: async (a: AppArguments) => await action(a)
}

export default cm

