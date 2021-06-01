
import yargs from 'yargs'
import http from 'http'

interface RbCliCall {
    option: string
}

const argv: RbCliCall = yargs
    .usage('Usage: $0 <command> [options]')
    .command('hello', 'Prints an option (default "hello world"')
    .options({
        option: {
            alias: 'o',
            description: 'Option',
            default: 'hello world'
        }
    })
    .argv;


const call = (snt: string) => {
    const arg = snt.split(' ').join('-')
    console.log('requesting for sentence ', arg)

    const options = {
        hostname: 'localhost',
        port: 8080,
        path: `/brackets?snt=${arg}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // 'Content-Length': data.length
        }
    }

    const req: http.ClientRequest = http.request(options, (res: any) => {
        console.log(`statusCode: ${res.statusCode}`)
        res.on('data', (d: any) => {
            process.stdout.write(d)
        })
    })

    req.on('error', (error: Error) => {
        console.error(error)
    })

    req.write('{}')
    req.end()

}

if (argv && argv.option) {
    call(argv.option)
}

/*

a major function will be xs (exact sentence).

xs(Np, Vp, Np2?, Np3?)

where the arguments are each brackets

(NP(DT a)(NN boy))
(VP(VBZ is))

so on.

"is" is special; so for now as long as a VP has a matching VBZ, that counts for "exact match"

*/
