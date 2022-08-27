import { Module } from '../../shared/utils/types'
import { evaluateFilter } from '../../runtime/store'

export const m: Module<{
    object: { length: number, forEach: typeof Array.prototype.forEach }
}> = {
    help: {
        description: 'use filters to evaluate a test "--object" value',
        options: {
            'object': 'a string of typed-out json to test evaluation on',
            'filters': 'using a pipeline of array filters and the dot-prop query language, drill down into the test object to display only a subset of the data'
        },
        examples: {
            [`--object '{"foo":"bar"}' --filters .foo`]: 'show "bar" (by drilling down using filters)',
            [`--object '{"foo":"bar", "arr": ["a","b", { "element": "c" } ]}' --filters .arr[0] slice(0)`]:
                'here, the filter pipeline consists of two elements: .arr[0] and slice(0). these are run as stages, feeding forward the result and running the next operator. if the argument looks like a function call that exists on Array.prototype, it will be treated as such. otherwiee it is treated using the dot-prop library.'
        }

    },
    fn: async (argv) => {
        const {
            object,
            filters: filtersQuery,
        } = argv

        const arrObject: any[] = []

        if (object.length > 0) {
            object.forEach((json) => {
                const obj = JSON.parse(json)
                arrObject.push(obj)
            })
        }


        return Promise.all(arrObject.map(async (obj) => {
            await evaluateFilter(obj, filtersQuery)
        }))

    }
}
export default m
