import { platformIsNode } from "./createApp"

type Referrable<ValType = any> = { [key: string]: ValType }

const isReferrable = <ValType = any>(arg: any): arg is Referrable<ValType> => {
    return typeof arg === 'object' && arg !== null
}

export const setSingleton = <ValType>(name: string, obj: ValType) => {


    if (platformIsNode) {
        if (!(global as any).singletons) {
            (global as any).singletons = {}
        }
        if (isReferrable<ValType>(obj)) {

            (global as any).singletons[name] = obj
        } else {
            throw new Error(`Value for ${name} is not referrable`)
        }

    } else {
        if (!(window as any).singletons) {
            (window as any).singletons = {}
        }
        if (isReferrable<ValType>(obj)) {

            (window as any).singletons[name] = obj
        } else {
            throw new Error(`Value for ${name} is not referrable`)
        }
    }

}

export const getSingleton = <ValType>(name: string): Referrable<ValType> => {


    let singletons: { [str: string]: any }

    if (platformIsNode) {
        singletons = (global as any).singletons
    } else {
        singletons = (window as any).singletons
    }
    if (!singletons) {
        throw new Error(`singletons have not been initted`)
    }
    if (!singletons[name]) {
        throw new Error(`Singleton not set; name ${name}`)
    }

    const sought = singletons[name]
    if (isReferrable(sought)) {
        return sought as Referrable<ValType>
    }
}


