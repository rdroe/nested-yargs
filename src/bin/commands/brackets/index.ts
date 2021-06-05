
import yargs, { Argv, CommandModule } from 'yargs'
import * as brackets from './brackets'
// import * as brackets_save from './commands/brackets_save'


const cm: CommandModule = {
    command: "brackets",
    describe: 'fetch, save (etc) constituent parses',
    builder: (yargs) => {

        return yargs.command({
            command: "get",
            describe: "fetch brackets",
            handler: brackets.action,
            builder: brackets.options
        })
    },
    handler: args => {
        console.log("handler foo!");
    }
}

export default cm
