import { Module } from '../src/appTypes'
const show = (val: object, prefix: string = '') => {
    Object.entries(val).forEach(([key, val]) => {
        console.log(`${prefix || ''}${key}`, val)
    })
}

const showProperties = ({ help }: Module, namespace: string) => {
    const { commands, options, examples } = help
    console.log('Commands:')
    show(commands)
    console.log('Options:')
    show(options)
    console.log('Examples:')
    show(examples, namespace + ' ')
}

export const showModule = (module1: Module, prefix = '') => {
    if (typeof module1 !== 'object') return
    showProperties(module1, prefix)
    if (!module1.submodules) return
    Object.entries(module1.submodules).forEach(([name, sm]) => {
        showModule(sm, `${prefix} ${name}`)
    })

}
