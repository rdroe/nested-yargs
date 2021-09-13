import { Module, AppArguments } from '../../appTypes'
import { jqEval } from '../../lib/store'

export const m: Module = {
    help: {
        commands: {
            $: 'use jq to evaluate a test "--object" value'
        },
        options: {
            'object': 'a string of typed out json to test evaluation on',
            'jq': 'using the jq language (or nyargs custom operators), drill down into the test object to display only a subset of the data'
        },
        examples: {
            [`cache eval --object '{"foo":"bar"}' --jq .foo`]: 'show "bar" (by drilling down using jq)',
            [`cache eval --object '{"foo":"bar"}' '{"foo": "baz"}' --jq .foo`]: 'show "bar" and "baz" (by drilling down using jq)',

        }

    },
    fn: async (argv: AppArguments) => {
        const {
            object,
            jq: jqQuery,
        } = argv

        const arrObject: any[] = []

        if (object.length > 0) {
            object.forEach((json) => {
                const obj = JSON.parse(json)
                arrObject.push(obj)
            })
        }


        return Promise.all(arrObject.map(async (obj) => {
            await jqEval(obj, jqQuery)
        }))

    }
}
export default m
