import { AppArguments, Module } from '../../appTypes'

import { importDb } from '../../hooks'
import { deps } from '../../../index'
export default {
    help: {
        description: 'import a json file to the cache db (i.e. a file previously saved using "cache back ..." command',
        options: {},
        examples: {}
    },
    fn: async (args: AppArguments) => {
        const db = await deps.get('db')
        const fs = await deps.get('fs')
        const now = Date.now()
        const newId = await db.cache.add({
            commands: ['la', 'tra'],
            names: ['fa', 're'],
            value: 1,
            createdAt: now
        })
        await db.cache.delete(newId)

        const result = await importDb(fs, args.path, args.filename, db.backendDB())
        await db.cache.delete(now)
        return result
    },
    yargs: {
        filename: {
            alias: 'f',
            type: 'string',
            default: `back-${Date.now()}.json`
        },
        path: {
            alias: 'p',
            type: 'string',
            default: `data`
        }
    }
} as Module
