#!/usr/bin/env node
import { setDictionary  } from './src/loop'
import { repl } from './src/setUp'
import match from './src/commands/match'
import cache from './src/commands/cache'
import { program } from './index'


setDictionary({
    matchTwos: ['match scalar --l 2 --r 2']
})

repl({ match, cache, program })

// replNy([testModule], 'testcli --help')
