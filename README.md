
# nyargs

Isomorphic utilities and caching environment for architecting frontend data on the command line. `nyargs` provides a repl and cache-expansion syntax for interactively building fetched data into useful patterns.

The simple idea is that you import this repl-runner and load your own CLI-command modules into it. You then have a repl in which your custom commands are recognized. Also, with the caching and fetch functionality, it makes it a great web-app tool.

The cache is backed by IndexedDB. This repo is developed as a laboratory for creating frontend data functionality. Yargs modules, too, can be used from the frontend; so in developing a nyargs project, you are also in part developing a frontend project. 

```typescript
import myModule from './myModule'
import otherModule from './otherModule'
import {repl} from 'nyargs'

repl([myModule, otherModule])

```

## Structure of Modules

Please see the structure of a yargs CommandModule (a type provided by `@types/yargs`)

For the yargs modules you use in nyargs, they definitely require these properties:
- options
- builder
- handler (async function is required)
- describe

Again, [Yargs's docs](https://yargs.js.org/docs) should cover those properties.

## CLI Cache Language

`nyargs` does default or user-specialized caching of command-line results. for this caching, `fake-indexeddb` is used, which enables developing data models that can also be used in the browser. (Also of note: our importable fetch and post functionality uses isomorphic-fetch.)

The following example presumes some programming of the `request id` and `request name` modules the user would be expected to do.

Suppose 'request age' is a user-defined module that accepts parameters and makes a get request. 

```bash 
nyargs > request id --user amit 
```

This would return results (such as a user id) that would be automatically cached for use in future commands. They would be cached under the commands namespace ['request', 'age'].


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
{ "data": 
	{
	  "id": 88
	} 
}
```

Then your retrieval code could, embedded in cli call, would look like this:

```bash
... {request age``.data.id} ...
```

There, `.data.id` is a jq filter saying essentially "look at the data property, and within data look at the id property."
