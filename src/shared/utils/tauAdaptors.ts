type ObjectOrFailure = object | 'fail'
interface Answer {
    prolog: string
    json: ObjectOrFailure
}

export type Answers = Answer[]
export type DestructuredAnswer = {
    predicates: string[]
    destructured: { [str: string | number]: any }
}

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

const destructureAnswer = (ans: ObjectOrFailure, contexts: any[]): DestructuredAnswer => {
    localLogger('called destructureAnswer', ans)

    // TODO: use typings throughout this file
    const links = (ans as any).links
    const predicates: string[] = []
    const destructured = Object.entries(links).reduce((accum, [key, obj /* re-type this as obj*/]: [string | number, any]) => {

        if (isNonListArg(obj)) return { ...accum, [key]: obj }
        contexts.push([])
        reduceToArray(obj, contexts, predicates)

        return { ...accum, [key]: contexts.pop() }
    }, {})

    return { predicates, destructured }

}

export const destructureAnswers = (ans: Answers): DestructuredAnswer[] => {
    localLogger('destructureAnswers', JSON.stringify(ans, null, 2))
    const contexts: any[] = []

    const tauLinks = ans.map(anAns => anAns.json).filter((resp) => resp !== 'fail')
    const destructured = tauLinks.map((ans) => destructureAnswer(ans, contexts)).filter((destruct) => destruct !== null)

    return destructured
}

