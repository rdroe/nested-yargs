import { parseCli } from '../../shared/utils/validation'
import { Module } from '../../shared/utils/types'


const cm: Module<{ positional: string[] }> = {
    help: {
        description: 'test parsing',
        options: {

        },
    },
    fn: async function({ positional }) {
        const arr = ['hello', '1', '200', '200.22', '{}', '[{"oh": "boy"}]', '[{]', 'null']
        return parseCli.parse(arr)
    }
}

export default cm
