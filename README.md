
### rb-cli

A roebooks command-line tool that
- interacts like a graphical UI will do with the roebooks prolog app; and 
- does the above by making api calls to a remote server, as if to exercise and test endpoints the actual web program will use.






# TS-CLI README

Example / Boilerplate code for TypeScript-based CLI tool

## Development
The `dev` script will execute the `./src/bin/cli.ts` script directly with the `ts-node` TypeScript REPL:
```
$ npm run dev
```
Additional arguments to the CLI tool can be passed to `dev` after `--`, i.e.:
```
$ npm run dev -- --help
```

Otherwise, the local package folder can be symlinked via the `link` command:
```
$ npm link
```
allowing the custom `ts-cli` command to be used directly.


## Build
```
$ npm run build
```
