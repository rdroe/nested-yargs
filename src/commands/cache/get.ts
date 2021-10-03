import { Module, AppArguments } from '../../appTypes'

import { Query, where } from '../../lib/store'


export const m: Module = {
    help: {
        description: 'get cache variables',
        options: {
            'c:c or commands': 'array of command namespaces from which to fetch data (see db structure in store.ts)',
            'c:n or names': 'array of "names" namespaces from which to fetch data (see db structure in store.ts)',
            'jq': 'using the jq language (or nyargs custom operators), drill down into the js cache results to display'
        },
        examples: {
            '': 'show all results of the cache for all commands',
            '--c:c brackets get': 'show results from whenever the user has called "brackets get..." with or without further arguments',
            '--jq .[0].value': "show results from whenever the user has called ''cache get...'' with or without further arguments; furthermore, assuming tresult is an array, show the 1st element's ''value'' property. "
        }

    },
    fn: async (args: AppArguments) => {
        const {
            'c:c': commands,
            'c:n': names,
            jq: jqQuery
        } = args

        const query: Query = {
            commands: (commands && commands[0] && commands[0] === '*') ? '*' : commands || undefined,
            names: (names && names[0] && names[0] === '*') ? '*' : names || undefined,
            _jq: jqQuery
        }

        if (typeof args.id === 'number') {
            query.id = args.id
        }
        return where(query)
    }
}
export default m
