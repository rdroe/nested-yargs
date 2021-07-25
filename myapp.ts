#!/usr/bin/env node

import ny from './index'
// import { repl } from './index'
import testModule from './src/commands/testModule/index'

ny([ testModule ]).then((x) => console.log('hello',x))

// replNy([testModule], 'testcli --help')
