import { Module } from '../../shared/utils/types'

import { Query, where } from '../../runtime/store'

export const m: Module<{ id: number }> = {
    help: {
        description: 'get cache variables',
        options: {
            'c:c or commands': 'array of command namespaces from which to fetch data (see db structure in store.ts)',
            'c:n or names': 'array of "names" namespaces from which to fetch data (see db structure in store.ts)',
            'filters': 'using the filter-pipeline language (array operators and dotprop stages), drill down into the js cache results to display'
        },
        examples: {
            '': 'show all results of the cache for all commands',
            '--c:c brackets get': 'show results from whenever the user has called "brackets get..." with or without further arguments',
            '--filters 0.value': "show results from whenever the user has called ''cache get...'' with or without further arguments; furthermore, assuming tresult is an array, show the 1st element's ''value'' property. "
        }

    },
    yargs: {
        filters: {
            array: true
        }
    },
    fn: async (args) => {

        const {
            'c:c': commands,
            'c:n': names,
            filters
        } = args

        const query: Query = {
            commands: (commands && commands[0] && commands[0] === '*') ? '*' : commands || undefined,
            names: (names && names[0] && names[0] === '*') ? '*' : names || undefined,
            filters
        }
        query.id = args.id
        return where(query)
    }
}
export default m
