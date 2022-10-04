import { Module, platformIsNode, tauAdaptors } from 'nyargs'
import { destructureSwipl, call } from 'nyargs/runtime'
import { query } from '../util/pl'

const { post } = call

const cliQuery = async (args: { p?: string, positional: (string | number)[] }) => {

    let prologQuery: string
    if (args.p) {
        prologQuery = args.p
    } else if (args.positional && args.positional[0] && typeof args.positional[0] === 'string') {
        prologQuery = args.positional[0]
    }

    const req = post('http://localhost:8081', { query: prologQuery })
    const resp = await req
    const json = await (resp as any).data
    return destructureSwipl(json ?? {})
}


const pl: Module = {
    help: {
        description: "For valid strings on a whitelist, query the prolog server (not production-ready).",
        examples: {
            "member(1, [1,2,3,4]).": 'presuming that "member" is whitelisted, send this query to the running swipl server and get back json result'
        }
    },
    fn: async (args) => {
        if (platformIsNode) {
            return cliQuery(args)
        }
        const answers = await query(args.positional[0])
        return answers
    }
}

export default pl
