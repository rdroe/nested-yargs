import { Module, AppArguments } from '../../appTypes'
import { Entry, put, jqEval } from '../../lib/store'

export const m: Module = {
    help: {
        commands: {
            $: 'get cache variables'
        },
        options: {
            'c:c or commands': 'array of command namespaces from which to fetch data (see db structure in store.ts)',
            'c:n or names': 'array of "names" namespaces from which to fetch data (see db structure in store.ts)',
            'jq': 'using the jq language (or nyargs custom operators), drill down into the js cache results to display'
        },
        examples: {
            'cache get': 'show all results of the cache for all commands',
            'cache get --c:c brackets get': 'show results from whenever the user has called "brackets get..." with or without further arguments',
            'cache get --jq .[0].value': "show results from whenever the user has called ''cache get...'' with or without further arguments; furthermore, assuming tresult is an array, show the 1st element's ''value'' property. "
        }

    },
    fn: async (argv: AppArguments) => {
        const {
            'c:c': commands,
            'c:n': names,
            scalar,
            object,
            jq: jqQuery
        } = argv


        const arrObject: any[] = []

        if (object.length > 0) {
            object.forEach((json) => {
                const obj = JSON.parse(json)
                arrObject.push(obj)
            })
        }


        return Promise.all(
            arrObject
                .concat(scalar ?? [])
                .map((ev) => {
                    const entry: Entry = {
                        commands,
                        names,
                        value: ev,
                        _jq: jqQuery
                    }
                    return put(entry)
                }))

    }
}
export default m
