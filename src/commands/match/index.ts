
import { CommandModule, Argv } from 'yargs'
import * as scalar from './scalar'
import { cache, branch } from '../../hooks/helpers'

const cm = {
    command: 'match',
    describe: 'test whether arguments do match',
    builder: async (yargs: Argv) => {
        return yargs.command({ ...cache(scalar, '.[] | select(.match == true) | [.left, .right]') })
    }
}

export default branch(cm)

