
import yargs from 'yargs'
import fetch from 'isomorphic-fetch'

interface BracketsCliCall {
    sentence: string,
    _?: Array<number | string>
}

const argv: BracketsCliCall = yargs
    .usage('Usage: $0 <command> [options]')
    .command('brackets', 'requests the parse for a sentence')
    .demandCommand(1)
    .demandOption(['sentence'])
    .options({
        sentence: {
            alias: 's',
            description: 'sentence to parse',
            default: '/'
        }
    })
    .argv

const [command] = argv._

const parse_brackets = (snt: string) => {
    const arg = snt.split(' ').join('-')
    const path = `http://localhost:8080/brackets?snt=${arg}`
    return fetch(path)
}


if (argv && argv.sentence) {
    parse_brackets(argv.sentence).then((data: any) => {
        data.json().then((json: any) => {
            console.log(json)
        })
    })
}
