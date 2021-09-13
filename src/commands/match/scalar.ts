import { Module } from '../../appTypes'

const cm: Module = {
    help: {
        commands: {
            $: 'test whether the supplied scalar pairs are equal'
        },
        options: {
            'l (left)': 'comparison value',
            'r (right)': 'comparison value'
        },
        examples: {
            '-l 1 2 3 -r 1 2 4': 'test whether 1 equals 1, 2 equals 2, and 3 equals 4; output contains a map and list of equalities.'
        }
    },
    fn: async function scalarMatch(argv: { l: any, r: any }) {

        let left: any[]
        let right: any[]
        const { l, r } = argv
        if (typeof l !== 'object') {
            left = [l]
        } else {
            left = l
        }
        if (typeof r !== 'object') {
            right = [r]
        } else {
            right = r
        }

        return left.map((ll, idx) => {
            const rt = right[idx]
            return {
                index: idx,
                match: ll === rt,
                left: ll,
                right: rt
            }
        })
    },
    yargs: {
        l: {
            alias: 'left',
            array: true
        },
        r: {
            alias: 'right',
            array: true
        }
    }
}



export default cm
