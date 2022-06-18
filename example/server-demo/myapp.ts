import { cache, program, match, setDictionary, repl } from 'nyargs/dist-server/src/lib/input/server'

import yargs from 'yargs'

setDictionary({
    matchTwos: ['match scalar --l 2 --r 2']
})

// repl({ match, cache, program },
repl({ match, cache, program }, yargs)
// replNy([testModule], 'testcli --help')
