
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
    const { a: a_, anarg: a2_ } = args
    const str = a_ ?? a2_
    if (typeof (str) !== 'string' && typeof (str) !== 'number') {
        throw new Error('option anarg must be a string or number.')
    } else {
        console.log(`${str} .... in bed!!!`)
    }
}

const level2 = leaf('level2', subOpts, subAct, 'test working opts')

const level1 = stem('level1', [level2], 'test level 2: do  subcmds work?')

export default stem('testcli', [level1], 'test: do cmds, subcmds work?')
