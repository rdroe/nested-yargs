// this is bundle-able to esbuild.
// you can't actually use a script tag with "module" in a browser
// to "import" stuff from esbuild, so this is needed to act as the browser's script tag. contents. 
import { setUp as browserSetUp } from './index.raw'
// myapp imports
const terminals = new Map()
const elem = document.querySelector('#terminal') as HTMLElement

const { getInput } = browserSetUp(elem, terminals)

const promptRepeater = async () => {
    await getInput('nyargs >')
    promptRepeater()
}
promptRepeater()



// start myapp ts imitation
/*
setDictionary({
    matchTwos: ['match scalar --l 2 --r 2']
})
*/

// repl({ match })

// end myapp ts imitation
