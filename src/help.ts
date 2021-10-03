import { Module } from '../src/appTypes'

const show = (propName: 'options' | 'examples', obj: any, prefix: string = '') => {
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

const showProperties = ({ help = { description: '' } }: Module, namespace: string) => {
    if (help.description) {
        console.log(help.description)
    }
    show('options', help)
    show('examples', help, `$ ${namespace}`)
}

export const showModule = (module1: Module, prefix = '') => {
    if (typeof module1 !== 'object') return
    const submodulesArray = Object.entries(module1?.submodules ?? {})
    if (prefix) {
        console.log('')
        if (submodulesArray.length) {
            console.log('namespace', prefix.trim(), '------')
            console.log('( children: ', submodulesArray.map(([key]) => key).join(', '), ')')
        } else {
            console.log('subcommand', prefix.trim())
        }
    }
    showProperties(module1, prefix)
    if (!module1.submodules) return
    Object.entries(module1.submodules).forEach(([name, sm]) => {
        showModule(sm, `${prefix.trim()} ${name.trim()}`)
    })

}
