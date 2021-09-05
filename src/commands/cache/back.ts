import { AppArguments } from '../../appTypes'
import { CommandModule } from 'yargs'
// import { idb } from 'some-database'
// import { serializedData } from 'some-serialized-data'
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


        args.result = exportToJson(dbBack)
            .then(async (dat) => {
                fs.writeFileSync(args.filename, dat, 'utf8')
            })
        return args
    }

}

export default cm
