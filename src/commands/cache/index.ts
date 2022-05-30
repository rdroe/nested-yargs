import { Module, Options } from '../../appTypes'

import get from './get'
import back from './back'
import put from './put'
import eval from './eval'
import imp from './import'
import clear from './clear'

const filters: Options = {
    description: 'query element to apply in put-able or entry object',
    alias: 'f',
    type: 'array',
    default: ['.']
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
        description: 'put or get cache vars using indexedDB; also, save or import the backup cache databases.',
        options: {

        },
        examples: {
        }
    },
    fn: async () => {
        console.log('Cache operation hub.')
    },
    yargs: {
        filters,
        scalar,
        object,
        id
    },
    submodules: {
        get,
        put,
        eval,
        back,
        import: imp,
        clear
    }
}

export default cm

