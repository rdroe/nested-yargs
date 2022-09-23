import { store } from 'nyargs/br'

export { linesFromTurnData } from './turnDataReducers'
const { where } = store
export type DestructuredAnswer = {
    predicates: string[]
    destructured: { [str: string | number]: any }
}
type FILTER_ARG = (typeof store)["FILTER_ARG"]
type Term = Omit<Omit<string, "./2">, "[]/0">
interface Arg {
    index: string | number
    ground: boolean
}

interface ValueArg extends Arg {
    value: string | number
    is_float: boolean
}

interface PredicateArg extends Arg {
    ref: string
    id: string
    args: (ListyArg | NonListArg)[]
    indicator: Term
}

type NonListArg = ValueArg | PredicateArg

interface ListyArg extends Arg {
    ref: string
    id: string
    args: (ListyArg | NonListArg)[]
    indicator: "[]/0" | "./2"
}

export type Predicates = Term[]

const localLogger = console.log


const isTermArg = (arg: any): arg is PredicateArg => {

    if (arg.index === undefined || arg.ground === undefined) return true
    const isTerm: boolean = (
        typeof arg.value === 'undefined'
        && (arg.id !== '.' && (["[]/0", "./2"].includes(arg.indicator) === false))
    )
    return isTerm
}


const isNonListArg = (arg: any): arg is NonListArg => {
    if (arg.index === undefined || arg.ground === undefined) return true
    const isNonList: boolean = (
        // non list may be a value arg...
        typeof arg.value !== 'undefined'
        || isTermArg(arg)
    )
    return isNonList
}

const isListArg = (arg: any): arg is ListyArg => {
    return typeof arg.is_float === 'undefined'
}


// case [ {value: 10}, { id: "[]", indicator: "[]/0" } ] //  means 10 is last in a list
// case [ {value: 5}, { id: ".", indicator: "./2"  } // means 5 is in a continuing list
// case [ { id: "[]" , indicator: "[]/0" }, {indicator: "[]/0"} ] would mean a next element is an actual user's empty list.
// case [ { id: ".", indicator: "./2"  }, { id: ".", indicator: "./2"  } ] would be a new list in an ongoing list
// case [ { id: ".", indicator: "./2"  }, {  indicator: "[]/0"  } ] would be a new list is the last element of the ongoing (now ending) list

const reduceToArray = (obj: any, contexts: any[], predicates: Predicates): void => {

    localLogger('called reduce to array', obj)

    if (!isListArg(obj)) throw new Error('Not a listy arg')

    if (obj.args.length === 0) {
        localLogger('0 length arg passed');
        return
    }
    if (obj.args.length > 2) {
        throw new Error('Unhandled case when traversing a prolog list (0)')
    }
    const [first, second] = obj.args
    // Weird way to find out if this is atom / predicate / number, as opposed to a nested list.
    const isNonList: boolean = isNonListArg(first)

    const tail: string | null = isListArg(second) && second.indicator || null

    localLogger('entering switch; contexts:', JSON.stringify(contexts))
    switch (isNonList) {
        // First, handle scalar (or for now, term- or predicate-like) elements as head.
        case true:
            // Always push in this non-list element
            // TODO: This is where we lose term arguments; e.g. nyc(1) would be bluntly pushed in here, here, instead of the traversal handling it properly.
            localLogger('pushing in a non-list value from object', first)
            contexts[contexts.length - 1].push(first.index)

            if (isTermArg(first)) {
                predicates.push(first.indicator)
            }
            switch (tail) {
                case "[]/0":
                    // If the tail is empty, it indicates the head is the final element in this subtree.
                    localLogger('popping a context (head was non-list value-ish')
                    // contexts.pop()
                    return
                case "./2":
                    // If tail opens another binary tree, there are further elements for current context.
                    localLogger('next element in tree...(a)')
                    reduceToArray(second, contexts, predicates)
                    localLogger('back from (a) ; conctexts and results', JSON.stringify({ contexts }))
                    return
                default:
                    throw 'Unhandled case when traversing prolog list (1)'

            }

        case false:
            localLogger('found a list element as first in tree; pushing new context')
            contexts.push([])


            localLogger('with new context, handling list.')
            reduceToArray(first, contexts, predicates)
            const parent = contexts[contexts.length - 2]
            parent.push(contexts.pop())


            switch (tail) {
                case "[]/0":
                    // if  tail is empty, the head list is the last element in the list.
                    localLogger('empty tail list found; popping context. head was listy')
                    // contexts.pop()
                    return
                case "./2":
                    localLogger('tail list with elements found; going deeper.')
                    reduceToArray(second, contexts, predicates)

                    return
                default:
                    throw 'Unhandled case when traversing prolog list (2)'

            }
    }

}

interface SwiplBindings {
    [varName: string]: SwiplVal
}

type SwiplScalar = string | number
type SwiplVal = SwiplScalar | SwiplHT | SwiplEmptyList | SwiplCompound
type SwiplEmptyList = '[]'
interface SwiplHT {
    head: SwiplVal,
    tail: SwiplVal
}

interface SwiplCompound {
    name: SwiplScalar
    args: SwiplVal[]
}

/**
   eg { A: { head: '1', tail: '[]' }}
*/
const isSwiplBindings = (arg: any): arg is SwiplBindings => {

    if (Object.values(arg).find((anArg: any) => {


        return !isSwiplVal(anArg)
    })) {
        return false
    }
    return true
}

const isSwiplScalar = (arg: any): arg is SwiplScalar => {
    if (arg === '[]') return false
    return typeof arg === 'string' || typeof arg === 'number'
}

const isSwiplHT = (arg: any): arg is SwiplHT => {
    if (arg === null || typeof arg !== 'object') return false
    if (arg.head === undefined) return false
    if (arg.tail === undefined) return false
    if (arg.head === null) return true // actually, null head and non-undefined tail is ok
    return isSwiplVal(arg.head) && isSwiplVal(arg.tail)
}

const isSwiplCompound = (arg: any): arg is SwiplCompound => {
    if (arg === null) { return false }
    if (!arg.name || !arg.args) return false
    if (!isSwiplScalar(arg.name)) return false
    if (!Array.isArray(arg.args)) return false

    // if it is a compound, we should not be able to find a non-swipl argument
    return arg.args.find((anArg: any) => {
        return !isSwiplVal(anArg)
    }) === undefined

}

const isSwiplVal = (arg: any): arg is SwiplVal => {
    const truth = isSwiplEmptyList(arg) || isSwiplScalar(arg) || isSwiplHT(arg) || isSwiplCompound(arg)
    if (truth) return true
    if (!truth) {

        console.log('not a swipl val', arg)
    }

    return truth

}

const isSwiplEmptyList = (arg: any): arg is SwiplEmptyList => {
    return arg === '[]'
}

type FlattenedCompound = { name: string, args: NestedScalars }

type FlattenedBinding = { [bindingName: string]: any }

type NestedScalars = (SwiplScalar | FlattenedCompound | NestedScalars)[]

const destructureS = (arg: SwiplVal): SwiplScalar | SwiplEmptyList | NestedScalars | FlattenedCompound => {

    if (isSwiplEmptyList(arg)) {
        return []
    } else if (isSwiplScalar(arg)) {
        return arg
    } else if (isSwiplHT(arg)) {
        const { head, tail } = arg
        const flattenedHead = head === null ? null : destructureS(head)
        const flattenedTail = destructureS(tail)
        if (Array.isArray(flattenedTail)) {
            return [flattenedHead, ...flattenedTail]
            // scalar tail, array head 
        }
        return [flattenedHead, flattenedTail]

    } else if (isSwiplCompound(arg)) {

        const { name, args: cmpdArgs } = arg

        const flattenedArgs = cmpdArgs.map(destructureS)
        return { name: name.toString(), args: flattenedArgs }

    }
    throw new Error(`Could not detect this to be a swipl value: ${arg}`)
}

export const destructureSwipl = (data?: any[]): FlattenedBinding[] => {

    if (!data) throw new Error('Cannot destructure null or undefined')

    data.forEach((elem: any) => {
        if (!isSwiplBindings(elem)) throw new Error(`Not a set of swipl bindings: ${JSON.stringify(data)}`)
    })

    // array of results reducer
    return (data as SwiplBindings[]).reduce((accum: FlattenedBinding[], curr: SwiplBindings) => {

        const entries = Object.entries(curr)

        return [
            ...accum, {
                // reducer on a set of bindings
                ...entries.reduce((accum, [varName, swiplVal]: [string, any]) => {

                    return {
                        ...accum,
                        [varName]: destructureS(swiplVal)

                    }
                }, {} as FlattenedBinding)
            }
        ]

    }, [] as FlattenedBinding[])

}

const filterNull = (binding: any) => {
    return binding.filter((val: any) => val !== null)
}

export const lastPredicateBindings = async (binding: string) => {

    const query: {
        commands: string[]
        names: '*'
        filters: string[]
    } = {
        names: '*' as '*',
        commands: ['q'],
        filters: [`map(value.0.${binding})`]
    }
    const whereResult = await where(query)
    const filtered = filterNull(whereResult)
    return filtered
}
