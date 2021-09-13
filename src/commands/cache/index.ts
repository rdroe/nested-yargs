import { Module } from '../../appTypes'
import { Options } from 'yargs'
import get from './get'
import back from './back'
import put from './put'
import eval from './eval'
import imp from './import'
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
    type: 'number'
}

const object: Options = {
    description: 'value parse-able to json to insert as an object as value of entry',
    alias: 'v:o',
    type: 'array',
    default: []
}




const cm: Module = {
    help: {
        commands: {
            $: 'put, get cache vars; also, save or import the backupd cache databases.'
        },
        options: {

        },
        examples: {
        }
    },
    fn: async () => {
        console.log('Cache operation hub.')
    },
    yargs: {
        command,
        names,
        jq,
        scalar,
        object,
        id
    },
    submodules: {
        get,
        put,
        eval,
        back,
        import: imp
    }
}

export default cm

