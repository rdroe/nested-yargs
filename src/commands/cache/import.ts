import { AppArguments } from '../../appTypes'
import { CommandModule } from 'yargs'
import db from '../../lib/store'
import { importFromJson, clearDatabase } from '../../lib/idb-backup-and-restore'
import fs from 'fs'

const cm: CommandModule = {
    command: 'import [filename]',
    describe: 'read to cache from a json file',
    builder: {
        filename: {
            alias: 'f',
            type: 'string'
        },
        path: {
            alias: 'p',
            type: 'string',
            default: `data/`
        }
    },
    handler: async (args: AppArguments) => {
        await db.cache.add({
            commands: ['la', 'tra'],
            names: ['fa', 're'],
            value: 1,
            createdAt: Date.now() - 1
        })

        const file = fs.readFileSync(`${args.path}/${args.filename}`, 'utf8')
        const dbBack = db.backendDB()
        await clearDatabase(dbBack)
        args.result = await importFromJson(dbBack, file)
        return args
    }
}

export default cm
