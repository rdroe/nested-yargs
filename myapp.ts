#!/usr/bin/env node


// import ny from './index'
import { repl } from './index'
import match from './src/commands/match'
import cache from './src/commands/cache'

repl({ match, cache })

// replNy([testModule], 'testcli --help')
