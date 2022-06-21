import { repl, cache, program, match, setDictionary } from 'nyargs/dist-browser/src/lib/input/browser'

import element from 'nyargs/dist-browser/src/commands/element'
// import element from './commands/element'


// Bootstrap yargs for browser:

// @ts-ignore
import yargs from 'https://unpkg.com/yargs@16.0.0-beta.1/browser.mjs';

setDictionary({
    matchTwos: ['match scalar --l 2 --r 2']
})

repl({ match, cache, program, element }, yargs(), 'rb > ')

document.head.innerHTML += `<style>
.text-area-container {
    position: fixed;
    right: 0;
    width: 35%;
    height: 10%;
}

.print-area {
    position: fixed;
    top: 0;
    height: 100%;
    overflow: scroll;
}

.print-area-text {
    position: absolute;
    margin-bottom: 10vh;
}

.print-area:not(.is-offscreen) {

    width: 20vw;
    right: 0;
}

.print-area.is-offscreen {
    right: -100%;
}

.print-area > pre {
    width: 100%;
    border-bottom-width: 9vh;
    border-bottom-color: transparent;
    box-sizing: border-box;
    border-bottom-style: solid;    
}

.text-area-container.is-offscreen {
    bottom: -100%;
}

.text-area-container:not(.is-offscreen) {
    bottom: 0;
}

.text-area-container > textarea {
    background-color: rgba(0, 0, 0, 50%);
}

.ny-text-area {

}
</style>`
