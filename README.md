
### nested-yargs

I like writing utilities with multiple subcommands, `command subcommand -o 1` (instead of, say `command --subcommand -o 1`).

This is a template project for doing that in Typescript. This is a yargs wrapper along with a couple of http utilities (in `/src/lib/api`).

I have used this for node, but you could theoretically use it in the browser as well, however you do that with yargs. (yargs mentions browser-based use.) 

#### upshot

See the example `match` command, which lies in `src/bin`, and its subcommands. 

After installing and building (the latter is e.g. `npx tsc`), run, for example
```
./dist/bin/ny.js --help
```
or 
```
./dist/bin/ny.js match --help
```
or
```
./dist/bin/ny.js match scalar --help
```

This last command is usable with the options `-l [number|string]` and `-r [number|string]`.

A couple of utilities exist for convenience, some generic fetch and post commands. `isomorphic-fetch` is used.
#### adding modules
Remarks in `src/bin/commands/match/index.ts` show how you could add a parallel command such as `nonscalar` if you follow the command above; a sibling for `match scalar`.

To add other top-level modules, see where `match` is imported to `src/bin/ny.ts` and placed in an array. Write other modules alongside `match` in the file system.  Here in `ny.ts`, import them like `match` and place them in the same array. That will enable them as commands. 

Of course, when you write the new command modules, have their exports match those of `match`. Provide, for example, `export const description = ...` and `export const handler = ...` on each command that you add. There are a couple of other required named exports.

#### notes on cli calls
- Instead calling a file deeply nested in the project, such as `./dist/bin/ny.js ...`, you might consider compiling all the typescript to a single js file. If all the dependencies are contained in a single file, you would theoretically be able to place it anywhere in the filesystem. (The device needs to have node available, of course).
- You could rename `ny.js` to your own app's name or an abbreviation of same.


