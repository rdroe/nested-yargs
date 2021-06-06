
import { Options, CommandModule } from 'yargs'
import { RbOptions, Action, RbArgv } from '../appTypes'

const left: Options = {
    alias: 'l',
    description: 'left matchable',
    demandOption: true
}


const right: Options = {
    alias: 'r',
    description: 'right matchable',
    demandOption: true
}

const options: RbOptions = {
    left,
    right
}

const action: Action = (argv: RbArgv) => {
    const { left, right } = argv
    console.log(`Does ${left} match ${right}`, left === right ? ' Yes!' : 'No...')
}

const cm: CommandModule = {
    command: "match",
    describe: 'test and log whether -l matches -r with ===',
    builder: options,
    handler: (args) => {
        action(args as RbArgv)
    }
}

export default cm
