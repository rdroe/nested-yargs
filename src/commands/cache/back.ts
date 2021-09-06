import { AppArguments } from '../../appTypes'
import { CommandModule } from 'yargs'
import db from '../../lib/store'
import { exportDb } from '../../hooks'



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
            default: `data`
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
        args.result = await exportDb(args.p, args.f, dbBack)
        return args
    }

}


export default cm
