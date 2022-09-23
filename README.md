# nyargs: dual-platform typescript notebooks

nyargs allows you to write and build a modular codebase that you can run both in the browser and in node. it provides an in-browser cli or node-based cli  for both browser- and server-based application development.

the same database api can used everywhere. right now that is indexedDB. nyargs uses fake-indexeddb on the backend, but you can also write and restore indexedDB for some level of persistence.

## use cases
the seminal use case for this codebase is an app with lots of complex, interrelated data. with this particular kind of experimental development, seeing the data is extremely helpful. 

nyargs makes it easy to do CLI-like development in the browser; then use a framework like d3.js or babylon.js to visualize possible user interactions. 

another use case is for writing typescript or javascript that you want to verify as isomorphic (i.e. both node- and browser-friendly).

## react and other frameworks
the codebase is agnostic toward frameworks like react and vue. it is compatible with those, and react bindings are planned.

## features
- isomorphic fetch utilities 
  - built on isomorphic-fetch
- database everywhere
  - indexedDB, configurably real or fake, can be used on frontend or backend
  - import- and export-ready
- nested and parallelizable code modules
- cli-based test command

### todo
- use browser init in the browser example (not just in the dual example)
- document configurability
- easier export / import of data files in browser 
- more universal data adapter
- example with data-serving
- example with graphical "wow"
- example with prolog
- rust (wasm) modules


