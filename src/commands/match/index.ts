
import { CommandModule, Argv } from 'yargs'
import * as scalar from './scalar'

const cm: CommandModule = {
    command: 'match',
    describe: 'test whether arguments do match',
    handler: async () => {

    },
    builder: async (yargs: Argv) => {
        return yargs.command(scalar)
    }
}

export default cm

