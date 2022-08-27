

### feature requests

- testing framework with jest integration 
- complex commands (stop for user feedback mid-command)
- enable config to control console output [x]
- parent-child module control [x]
  - for example, accumulate multiple submodules calls for one parent module call.


### typings to clean up
- better definition for "Function" types under src/shared !
- better yargs-like types (for the user to definie their own cli arguments) !!
- fix multi-line programs !!
- better error paths [x]
  - may need work in how they're caught and handled [x]
  - may need work in maps w/r/t esbuild (don't bundle?) 
- export a config from the browser cli utils [x]
  - ability to pass a printOutput function
  - pass a mirror text area contents function [x]

- export config for other server and browser
- export an auto -executer 
- in browser, nicer looking output etc
- fix up the importDb call arguments. get rid of the shelljs crap everywhere. for fe and backend mack sure cache back works (write / dl file) [x]
