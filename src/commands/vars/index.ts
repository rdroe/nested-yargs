import { AppOptions, Action, AppArgv } from '../../appTypes'
import db from '../../lib/store'

type Command = 'put' | string
type PseudoArgv = { _: ['vars', Command, string | number], [x: string]: any }

const cmds = ['put', 'get']

// old
const extractNs = (argv: PseudoArgv) => {
    if (argv._[0] !== 'vars') throw new Error('wrong slotted command')
    const cmd = cmds.indexOf(argv._[1]) !== -1 ? argv._[1] : 'get'
    const ns = cmd === 'get' ? argv._.slice(2) : argv._.slice(2)
    console.log('ns arr', ns)
    const [name, ...values] = ns

    return { cmd, ns: 'one', name, value: values[0], vals: values }
}




const action: Action = async (argv: AppArgv) => {

    // redo
    const { cmd, ns, name, value = null } = extractNs(argv as PseudoArgv)
    if (cmd === 'get') {
        console.log('getting', cmd, ns, name, value)
        const x = await db.vars.where(ns).equals(name).toArray()
        console.log('get ', x)
    } else if (cmd === 'put') {
        const { name } = extractNs(argv as PseudoArgv)
        console.log('putting', cmd, ns, name, value)
        await db.vars.put({ [ns]: name, two: ['', ''], value })
    }
    return true
}

export default {
    command: "vars",
    describe: 'put, get (etc) variables',
    builder: {} as AppOptions,
    handler: async (a: any) => action(a as AppArgv)
}

