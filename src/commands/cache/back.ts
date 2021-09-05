import { AppArguments } from '../../appTypes'
import { CommandModule } from 'yargs'
import db from '../../lib/store'
import { exportToJson } from '../../lib/idb-backup-and-restore.js'
import fs from 'fs'


const cm: CommandModule = {
    command: 'back [filename]',
    describe: 'write cache to a json file',
    builder: {
        filename: {
            alias: 'f',
            type: 'string',
            default: `back-${Date.now()}.json`
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
            createdAt: Date.now() - 4
        })
        const dbBack = db.backendDB()
        const fname = `${args.path}${args.filename}`
        const dat = await exportToJson(dbBack)
        fs.writeFileSync(fname, dat, 'utf8')
        console.log(`wrote ${fname}`)
        args.result = fname
        return args
    }

}

export default cm
