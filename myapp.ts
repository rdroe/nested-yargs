#!/usr/bin/env node

// import ny from './index'
import { repl } from './index'
import testModule from './src/commands/testModule/index'


repl([ testModule ])

// replNy([testModule], 'testcli --help')
