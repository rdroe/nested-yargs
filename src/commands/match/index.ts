
import { CommandModule } from 'yargs'
import * as scalar from './scalar'

const cm: CommandModule = {
    command: 'match',
    describe: 'test whether arguments do match',
    builder: (yargs) => {
        return yargs.command(scalar)
        /* .command({
            command: "other_subcommand [options]",
            describe: "other match utility (besides scalar)",
            handler: other.action,
            builder: other.options})
        */
    },
    handler: () => {

    }
}

export default cm

