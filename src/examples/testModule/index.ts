
import { Options } from 'yargs'
import { Action, AppOptions, AppArgv } from '../../appTypes'
import { leaf, stem } from '../../setUp'

const anarg: Options = {
    alias: 'a',
    description: 'a sub-command option',
    demandOption: true
}

const subOpts: AppOptions = {
    anarg
}

const subAct: Action = (args: AppArgv) => {
    const anarg_ = args.anarg
    console.log(`${anarg_} ... in bed?`)
}

const level2 = leaf('level2', subOpts, subAct, 'test working opts')


const level1 = stem('level1', [level2], 'test level 2: do  subcmds work?')

export default stem('testcli', [level1], 'test: do cmds, subcmds work?')
