
type Referrable = { [key: string]: any } | Array<any>
type Scalarr = number | string | boolean | null

const isReferrable = (arg: any): arg is Referrable => {
    return typeof arg === 'object' && arg !== null
}

const singletons: { [key: string]: Referrable | { value: Scalarr } } = {}

const scalarNames: string[] = []

export const setSingleton = (name: string, obj: Referrable | Scalarr) => {
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

export const getSingleton = (name: string) => {
    if (!singletons[name]) return

    const sought = singletons[name]

    if (Array.isArray(sought)) {
        return sought
    }
    if (scalarNames.includes(name)) {
        if (sought.value !== undefined) {
            return sought.value
        }
        throw new Error(`Improperly stored value-based singleton at your key, ${name}`)
    }
    return sought
}

export default singletons 
