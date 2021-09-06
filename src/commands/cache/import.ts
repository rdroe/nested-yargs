import { AppArguments } from '../../appTypes'
import { CommandModule } from 'yargs'
import db from '../../lib/store'
import { importDb } from '../../hooks'
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
            default: 'data'
        }
    },
    handler: async (args: AppArguments) => {
        await db.cache.add({
            commands: ['la', 'tra'],
            names: ['fa', 're'],
            value: 1,
            createdAt: Date.now() - 1
        })
        args.result = await importDb(args.path, args.filename, db.backendDB())
        return args.result
    }
}

export default cm
