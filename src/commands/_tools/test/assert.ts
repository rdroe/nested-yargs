import {
    get
} from '../../../shared/index'
import { BaseArguments, Module, ModuleArgs } from '../../../shared/utils/types'
// @ts-ignore
import getProperty from 'dotprop'
import stringArgv from 'string-argv'


export const PASS = 'PASS'
export const FAIL = 'FAIL'





const arrEqual = (arr1: string[], arr2: string[]) => {
    return arr1.length === arr2.length && arr1.filter((arrOneElem) => {
        return arr2.includes(arrOneElem)
    }).length === arr1.length
}

const parseExpectation = (expected: string | number) => {
    if (expected === 'false') return false
    if (expected === 'true') return true
    if (expected === 'undefined') return undefined
    if (expected === 'null') return null
    return expected
}

interface AssertParams extends BaseArguments {
    positional: string[]
    't:c': string[]
    't:n': string[]
    where: string[]
}

const assert: Module<AssertParams> = {
    help: {
        description: 'look up a value and assert a match based on "===". the assertion value is stored in the cache as  PASS or FAIL',
        options: {
            '[position one]': 'dot-property lookup within the commands and names namespaces',
            't:n': 'the cached names associated with the value to assert within; this is an array like --c:c',
            't:c': 'the cached commands associated with the value to assert within; this is an array like --c:n'
        },
        examples: {
            [`test assert 0.value.argv.l 1 --t:c match scalar --c:n testTests pass`]: 'find the array of cached object (returns from nyargs-based commands) from runs of ["match", "scalar"]; assert that the first (0th) has a property at .value.argv.l equals 1. if this is true, return "PASS", if not return "FAIL". --c:n means the names testTests and pass will be stored as the "names" caching namespace entries.'
        }
    },
    yargs: {
        't:c': {
            array: true,
        },
        't:n': {
            array: true,
        },
        where: {
            array: true,
        }
    },
    fn: async (args) => {
        const dexieQuery: { commands?: string[], names?: string[] } = {}
        const cmds = args['t:c']
        const nms = args['t:n']

        if (cmds && Array.isArray(cmds)) {
            dexieQuery.commands = cmds
        }

        if (nms && Array.isArray(nms)) {
            dexieQuery.names = nms
        }

        if (!dexieQuery.names && !dexieQuery.commands) {
            throw new Error(`commands or names is required for testing`)
        }


        const db = await get('db')
        const all = await db.cache.toArray()

        const arr = all.filter((elem: any) => {

            const nMatch = ((!dexieQuery.names)
                || elem.names === '*'
                || arrEqual(dexieQuery.names, elem.names))

            const cMatch = ((!dexieQuery.commands)
                || elem.commands === '*'
                || arrEqual(dexieQuery.commands, elem.commands))

            return nMatch && cMatch
        })

        const checkPathRaw = args.positional[0]

        if (checkPathRaw.includes('[].')) {
            return whereResult(arr, args)
        } else {
            return normalResult(arr, args)
        }

    }
}

function normalResult(arr: any[], args: ModuleArgs<AssertParams>[0]) {
    const testable = getProperty(arr, args.positional[0])

    const expected = parseExpectation(args.positional[1])

    const result = (testable !== expected) ? FAIL : PASS
    const message: null = null
    return {
        result: [result],
        commands: args.positional,
        message,
        expected,
        received: testable
    }
}


function whereResult(arr: any[], args: ModuleArgs<AssertParams>[0]) {

    const where = args['where']
    if (!where || where.length === 0) throw new Error('Error; a "where" argument must accompany use of "[]" in a test path')

    const [filterProp, filterVal] = stringArgv(where[0])
    if (filterVal === undefined || filterVal === 'undefined') {
        throw new Error(`Filtering (unlike asserting) for undefined on a dot-prop is disallowed (property of filter was ${filterProp}; val was undefined or "undefined")`)
    }


    const [prop, checkProp] = args.positional[0].split('[].')


    const subArray = getProperty(arr, prop)
    if (!Array.isArray(subArray)) {
        throw new Error(`Element at prop ${prop} is not an array; ${typeof subArray}`)
    }

    const testableParent = subArray.find((elem: any) => {
        return getProperty(elem, filterProp) === filterVal
    })

    if (testableParent === undefined) {
        throw new Error(`Testing error; filtering a subarray on ${filterProp} did not turn up an object for the final drill-down.`)
    }

    const testable = getProperty(testableParent, checkProp)

    const expected = parseExpectation(args.positional[1])

    const result = (testable !== expected) ? FAIL : PASS
    let validAncestor: string | null | undefined = null;
    if (expected === undefined) {
        validAncestor = null
        const validAncestorPropArr = checkProp.split('.')
        validAncestorPropArr.pop()
        if (validAncestorPropArr.length === 0) throw new Error(`The property following "[]" must be a compound`)
        const validAncestorProp = validAncestorPropArr.join('.')
        validAncestor = getProperty(testableParent, validAncestorProp)
        if (validAncestor === undefined) {
            throw new Error(`When checking for undefined, the final ancestor must not itself be undefined (in this case, ${validAncestorProp} from ${checkProp})`)
        }
    }

    return {
        result: [result],
        message: validAncestor ? `valid ancestor for undefined check ${validAncestor}` : null,
        commands: args.positional,
        expected,
        received: testable
    }
}

export default assert
