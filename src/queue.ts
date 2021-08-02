
export const context: {
    [props: string]: null | Function | Promise<any>
} = {
    currentPromise: null,
    currentResolve: null
}

export const object: { resolver: null | Function } = { resolver: null }

export const add = (resolver: Function) => object.resolver = resolver


