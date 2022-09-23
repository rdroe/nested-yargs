
import isNode from '../shared/utils/isNode'
import { Module, ParallelModule } from '../shared/utils/types'
let appLoc: string
if (isNode()) {
    appLoc = process.cwd()
} else if (location && location.pathname) {
    appLoc = location.pathname
} else {
    appLoc = `[app name not found]`
}

const shown: Module[] = []
const show = (propName: 'options' | 'examples', obj: any, prefix: string = ' ') => {
    const propData = obj[propName] || {}
    const entries = Object.entries(propData)
    if (entries.length === 0) return
    console.log('\n', `- ${propName}: `)
    entries.forEach(([key, val]) => {
        const formattedKey = prefix ? `${prefix} ${key}` : key
        const separator = ':'
        console.log(formattedKey, separator, val)
    })
}

const getAliasedNames = (submodulesArray: [string, Module][]): string => {
    let aliasedChildNames = new Map<Module, string[]>()
    submodulesArray.forEach(([name, obj]) => {
        const currChildNames = aliasedChildNames.get(obj) ?? []
        currChildNames.push(name)
        currChildNames.sort((a, b) => {
            return a.length > b.length ? 1 : a.length === b.length ? 0 : -1
        })
        currChildNames.unshift(currChildNames.pop())
        aliasedChildNames.set(obj, currChildNames)
    })
    let legibleNames = ''
    aliasedChildNames.forEach((curr: string[]) => {
        let legibleName: string
        if (curr.length === 1) {
            legibleName = curr[0]
        } else if (curr.length > 1) {
            const start = curr[0]
            const last = curr.pop()
            legibleName = `${start} (as ${curr.join(', ')}, and ${last})`
        } else {
            throw new Error("Submodule array is present--but with no length! empty submodule array is disallowed")
        }
        legibleNames = `${legibleNames}${legibleNames === '' ? ': ' : '; '}${legibleName}`
    })
    return legibleNames
}

const showProperties = ({ help = { description: ' ' } }: Module | ParallelModule, namespace: string) => {

    console.log(`Command ::: ${namespace.trim() ? namespace.trim() : 'app at ' + appLoc}`)
    if (help.description) {
        console.log(help.description)
    }
    show('options', help)
    show('examples', help, `$ ${namespace}`)
}

export const showModule = (module1: Module, prefix = ' ') => {
    if (typeof module1 !== 'object') return
    if (!shown.includes(module1)) {
        shown.push(module1)
        const submodulesArray = Object.entries(module1?.submodules ?? {})
        const legibleNames = getAliasedNames(submodulesArray)
        console.log("\n")
        if (prefix !== ' ') {
            if (submodulesArray.length) {
                console.log('namespace', prefix.trim(), '------')
                console.log('(children', legibleNames, ')')
            }
        } else {
            console.log(`commands${legibleNames}`)
        }
        showProperties(module1, prefix)
        if (!module1.submodules) return
        Object.entries(module1.submodules).forEach(([name, sm]) => {
            showModule(sm, `${prefix.trim()} ${name.trim()}`.trim())
        })
    }
}
