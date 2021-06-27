
### rb-cli

#### upshot

`npx ./dist/bin/rb.js --help`

A roebooks command-line tool that
- interacts like a graphical UI will do with the roebooks prolog app; and 
- does the above by making api calls to a remote server, as if to exercise and test endpoints the actual web program will use.



### Top-level store
Some notes are due on the top-level store. 


An event is an event and its implied history: everything that must have happened to arrive here. Its time (in turns) is also implicit. 

Alias: event = subtree

A full tree is many events in their full, shared causality chain. The nodes here are possibilities. 

Alias: full tree = overview = possibilities

If the subtrees interact with the full tree, it might be by sharing a time. A time cursor on the full tree could be changeable. It could draw emphasis to possible trees. Another way would be a more detailed version of the same cursor: a history cursor. A full history would narrow emphasis to a single event/subtree.

The other major kind of data concerns the NPs within these events. 


### Initializing the writing UI
Fetches
1 - List Roebooks
2 - Main RB startup routine (affordances and auto-triggering initial path till a choice point)

### Populating Events

Fetch 1 - 
  params: empty history
  receipt: possible explicit events

The very first fetch will be for events given an empty history.

With initial, explicit events in hand, the second fetch will attempt to expand ontology of the sentence that constitutes the event. 

Fetch 2 - 
  params: top nps of fetched explicit event(s) from 1
  receipt: "is" linked nps, layer 1
  

