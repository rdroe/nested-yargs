import { Module } from '../../shared/utils/types'
import { exportDb } from '../../runtime/cache'
import { get } from '../../shared'

const m: Module<{ p: any, b: any, f: any }> = {
    help: {
        description: 'Back up the cache; in node, export it as a json file and write it to disk; or in browser, download to user',
        examples: {
            '-p subdir/foo -f backup.json': 'Export cache and save it in a file at "./subdir/foo/backup.json" or download to browser as subdir_foo_backup.json'
        }
    },
    fn: async (args) => {
        const now = Date.now()
        const db = await get('db')
        const newId = await db.cache.add({
            commands: ['la', 'tra'],
            names: ['fa', 're'],
            value: 1,
            createdAt: now
        })
        await db.cache.delete(newId)
        const dbBack = db.backendDB()
        return exportDb(args.p, args.f, dbBack)
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
}

export default m


