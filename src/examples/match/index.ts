
import * as scalar from './scalar'
import { stem, leaf } from '../../setUp'

const moduleScalar = leaf('scalar', scalar.builder, scalar.action, scalar.describe)

export default stem('match', [moduleScalar], 'test whether various kinds of arguments match')


