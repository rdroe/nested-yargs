# nyargs

Isomorphic utilities and caching environment for architecting frontend data on the command line. `nyargs` provides a repl and cache-expansion syntax for interactively building fetched data into useful patterns.

The simple idea is that you import this repl-runner and load your own CLI-command modules into it. You then have a repl in which your library of data functions is recognized. 

When you start up a cli app made with nyargs, you will see that your command prompt is replaced with `nyargs > ` awaiting a command.

The cache is backed by IndexedDB. This repo is developed as a laboratory for creating frontend data functionality. Yargs modules, too, can be used from the frontend; so in developing a nyargs project, you are also in part developing a frontend project. 


# App

"myModule" and "otherModule" are the code you'll write to utilize nyargs.

```typescript
import myModule from './myModule'
import otherModule from './otherModule'
import {repl} from 'nyargs'

repl({myModule, otherModule})

```

## Structure of Modules

A module (such as myModule or otherModule in the selection above) has some required properties:

myModle.js
```
export const myModule = {
	help: {
		description: 'verify that two values match'
	},
	fn: (arguments) => {
		const { option_one, option_two } = arguments
		return option_one + option_two
	}
}
```

The `fn` property is the actual code that will be run when you call the module from the cli or browser.

The arguments parameter in `fn` contains the yargs-parsed arguments. For example, if you entered the following at the cli-based repl

`nyargs > myModule -option_one 1 -option_two 2`

your function would receive this arguments object:

```
{
	_: [ 'myModule' ]
	option_one: 1,
	option_two: 2,
	...
}
```

The yargs-style argument object above has 
- A property for each argument the user passed using `-` or `--`
- A property `_` whose value is an array of the commands passed. 

See yargs docs for more information about the nyargs argument argument.

## Output and Automatic Caching 

The result yielded by a nyargs command is both output to the command line and cached for later use. 

At the time of running the above command, it would print the result to the command line; i.e. 

```
myModule result:
3
```

The same result is cached in an easy-to-retrieve way, available to the user's later nyargs command entries for parameters. 

To see the current, unlimited cache contents, enter `cache get`.

`cache get` would output something like 

```json
[
  {
    commands: [ 'myModule' ],
    names: [],
    value: 3,
    createdAt: 1633523023035,
    id: 1
  }
]
```

The cache syntax (overviewed below) allows the user to feed-forward prior nyargs results and plug them into subsequent command calls.
#### submodules 

Optionally, add a `submodule` property, an object with keys that are names for subcommands. 

For example, a module shaped like this:

```
export const hello = {
	help: {
		description: 'log "hello" and possibly call child modules'
	},
	fn: async (/* arguments , childResults */) => {
		console.log('hello')
	},
	submodules: {
		world: {
			fn: async (/* arguments */) => {
				console.log('world')
			}
			help: {
				description: 'in tandem with parent module, log "hello ... world " ',
				examples: {
					'': 'show a message "hello" and another, "world".'
				}
			}
		}
	}
	
}

repl({ hello })
```
would allow one of your app's users to enter 
```
nyargs > hello world
```
and see the expected console.log results (with undefined output beneath, as we did not return any data).

#### help 
Type '--help' with or without a command to see, respectively, the help contents for all available commands or the entered commands.

All descriptions, examples, and options listed will be shown as part of help. 

## CLI Cache Syntax

`nyargs` does default or user-specialized caching of command-line results. This way those results can be fed into subsequent cli calls. 

The following example presumes some programming of the `request id` and `request name` modules the user would be expected to do.

Suppose 'request age' is a user-defined module command that accepts parameters and makes a GET http request in the background. 

```bash 
nyargs > request id --user amit 
```

In our example, let's say this would return JSON results (such as a { id: 88 }). In the offscreen nyargs module (sort of like the myModule.ts example above), we would return that result from our function (the `fn` property).

The returned data would be the automatically cached data we're talking about. It would be cached and indexed by the commands used. The cache entry would look something like this:

```json
[
  {
    commands: [ 'request', 'id' ],
    names: [],
    value: { id: 88 },
    createdAt: 1633523023035,
    id: 1
  }
]
```



```bash
nyargs > request name --id {request age}
```

This bracketed portion would be expanded by nyargs into the last cached value under that namespace. 

When the cli user taps enter, the next line will show the expansion: 

```bash
nyargs > request name --id {request age}
RUN AUGMENTED ? > request name --id 88
```

The user would tap enter again, now, if the new, augmented cli command looked correct. Alternatively, more brackets could be added. Alternatively, the auto-expanded cli command could be manually edited.

### jq

The user ID returned by the first call, which was cached, might have the sought data embedded in JSON. (In fact, this is probable). 

For that reason, the cache syntax (`{request age}`) also accepts a jq filter. 

If the cached data looked like this: 

```json
[{ "data": 
	{
	  "id": 88
	} 
}]
```

Then your retrieval code could, embedded in cli call, would look like this:

```bash
... {request age``.[0].data.id} ...
```

There, `.data.id` is a jq filter saying essentially "look at the first element in a presumed array; assume that element is a nested object and retrieve the value at `.data.id`
