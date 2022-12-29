
type Referrable = { [key: string]: any } | Array<any>

const isReferrable = (arg: any): arg is Referrable => {
    return typeof arg === 'object'
}

const singletons: { [key: string]: any } = {}

const scalarNames: string[] = []

export const update = (name: string, obj: any) => {
    if (isReferrable(obj)) {
        singletons[name] = obj
        return
    }
    if (!scalarNames.includes(name)) {
        scalarNames.push(name)
    }
    singletons[name] = {
        value: obj
    }
}

export const get = (name: string) => {
    if (scalarNames.includes(name)) {
        if (singletons[name] !== undefined && singletons[name].value !== undefined) {
            return singletons[name].value
        }
        throw new Error(`Improperly stored value-based singleton at your key, ${name}`)
    }
    return singletons[name]
}

export default singletons 
