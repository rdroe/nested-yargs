
import yargs, { Argv, CommandModule } from 'yargs'
import * as getbr from './get'
import * as save from './save'

const cm: CommandModule = {
    command: "brackets",
    describe: 'fetch, save (etc) constituent parses',
    builder: (yargs) => {
        return yargs.command({
            command: "get [options]",
            describe: "fetch brackets",
            handler: getbr.action,
            builder: getbr.options
        }).command({
            command: "save [options]",
            describe: "save brackets",
            handler: save.action,
            builder: save.options
        })
    },
    handler: () => {

    }
}

export default cm
