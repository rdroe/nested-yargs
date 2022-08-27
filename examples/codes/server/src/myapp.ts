import { server } from 'nyargs'
import yargs from 'yargs'

const { repl, cache, program, match, nest, test } = server

repl({
    cache, program, match, nest, test
}, yargs(['']), 'myapp > ')

