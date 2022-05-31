import { AppArguments, Module } from '../../appTypes'
import { exportDb } from '../../hooks'
import { deps } from '../../lib/dynamic'

export default {
    help: {
        description: 'Back up the cache; export it as a json file and write it to disk',
        examples: {
            '-p subdir/foo -f backup.json': 'Export cache and save it in a file at "./subdir/foo/backup.json"'
        }
    },

    fn: async (args: AppArguments) => {
        const fs = await deps.get('fs')
        const shelljs = await deps.get('shelljs')
        const now = Date.now()
        const db = await deps.get('db')
        const newId = await db.cache.add({
            commands: ['la', 'tra'],
            names: ['fa', 're'],
            value: 1,
            createdAt: now
        })
        await db.cache.delete(newId)
        const dbBack = db.backendDB()
        return exportDb(fs, shelljs, args.p, args.f, dbBack)
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
