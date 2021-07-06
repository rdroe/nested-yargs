#!/usr/bin/env node

import ny, { stem } from './src/setUp'
import match from './src/examples/match'
import testModule from './src/examples/testModule'

// The main application (just doing node .... filename.js) is, itself, a stem.

// The imported examples, match and testmodule, are structures of stems but also leaves.

const main = stem('$0', [match, testModule], 'Cli app for testing a yargs wrapper')
		  
ny([main])
