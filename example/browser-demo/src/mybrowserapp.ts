import { repl, cache, program, match, setDictionary } from 'nyargs/dist-browser/src/lib/input/browser'
import element from 'nyargs/dist-browser/src/commands/element'
// import element from './commands/element'


// Bootstrap yargs for browser:

// @ts-ignore
import yargs from 'https://unpkg.com/yargs@16.0.0-beta.1/browser.mjs';

setDictionary({
    matchTwos: ['match scalar --l 2 --r 2']
})

repl({ match, cache, program, element }, yargs(), 'rb > ')
