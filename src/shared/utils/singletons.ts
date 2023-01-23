
type Referrable<ValType = any> = { [key: string]: ValType }

const isReferrable = <ValType = any>(arg: any): arg is Referrable<ValType> => {
    return typeof arg === 'object' && arg !== null
}

const singletons: { [key: string]: Referrable<unknown> } = {}

export const setSingleton = <ValType>(name: string, obj: ValType) => {
    if (isReferrable<ValType>(obj)) {
        singletons[name] = obj
        return
    }
}

export const getSingleton = <ValType>(name: string): Referrable<ValType> => {
    if (!singletons[name]) return
    const sought = singletons[name]
    if (isReferrable(sought)) {
        return sought as Referrable<ValType>
    }
}

export default singletons 
