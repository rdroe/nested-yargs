#!/usr/bin/env node
import { repl, loop } from './index'
import match from './src/commands/match'
import cache from './src/commands/cache'
import program from './src/commands/program'

loop.setDictionary({
    matchTwos: ['match scalar --l 2 --r 2']
})

repl({ match, cache, program })

// replNy([testModule], 'testcli --help')
