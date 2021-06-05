
import yargs, { Argv, CommandModule } from 'yargs'
import brackets from './commands/brackets/index'
import * as match from './commands/match'
import * as brackets_save from './commands/brackets_save'
import { RbArgv, Module } from './appTypes'


const modules = [
    brackets
]


const cm: CommandModule = {
    command: "foo",
    describe: 'do foo',
    builder: (yargs) => {
        console.log("builder foooo!");
        return yargs.command({
            command: "bar",
            describe: "do bar!",
            handler: a => {
                console.log("handler barr!");
            }
        }).command({
            command: "baz",
            describe: "do baz!",
            handler: a => {
                console.log("handler bazzzz!");
            }

        })
    },
    handler: args => {
        console.log("handler foo!");
    }
}





yargs.usage("$0 command")
    .command(cm)


modules.forEach((module: CommandModule) => {

    yargs.command(module)
})

yargs.demand(1, "must provide a valid command")
    .help("h")
    .alias("h", "help").argv


