import isNode from '../../../shared/utils/isNode'
import { getConfig } from '../../../shared'
import { Module, ModuleArgs } from '../../../shared/utils/types'
import assert, { PASS, FAIL } from './assert'

type TestArgEntry = { [str: string]: any }

const termOut = (fn: (str: string, finalLogger: Function) => void, plainLogger: Function) => {
    return (msgs: any[]) => {
        msgs.forEach(msg => {
            const strMsg = typeof msg === 'string' ? msg : JSON.stringify(msg, null, 2)
            fn(strMsg, plainLogger)
        })
    }
}

const termRedMsg = (str: any, plainLogger: Function) => plainLogger(`\x1b[31m%s\x1b[0m`, str)
const termGreenMsg = (str: any, plainLogger: Function) => plainLogger(`\x1b[32m%s\x1b[0m`, str)
const browserRedMsg = (str: any, plainLogger: Function) => plainLogger(`%c${str}`, "color: red;")
const browserGreenMsg = (str: any, plainLogger: Function) => plainLogger(`%c${str}`, "color: green;")

const getLogger = () => {
    const log = getConfig('messageUser')
    const red = isNode() ? termOut(termRedMsg, log) : termOut(browserRedMsg, log)
    const green = isNode() ? termOut(termGreenMsg, log) : termOut(browserGreenMsg, log)
    return { red, green, log }
}

const getTestLogger = async (arg1: ModuleArgs<TestArgEntry>[0]) => {
    const { red, green, log } = getLogger()
    return (anArg: { result: string[], commands: string[], expected: any, received: any }) => {
        log(`ran test ${arg1.positional[0]} ${anArg.commands.join(' ')}`)
        const testResData = {
            expected: anArg.expected, received: anArg.received
        }

        if (anArg.result.includes(FAIL)) {
            red([FAIL])
            red([testResData])
        } else {
            green([PASS])
            green([testResData])
        }
    }
}

const test: Module<TestArgEntry> = {
    help: {
        description: 'test functions',
    },
    fn: async (arg1: any, arg2: any) => {
        const logger = await getTestLogger(arg1)
        Object.values(arg2).map(logger)
    },
    submodules: {
        assert
    }
}


export default test
