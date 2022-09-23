
import { cache, match, element, nest, repl, program, test } from 'nyargs/br'

export const app = (yargs: Function) => repl({
    cache,
    match,
    element,
    nest,
    program,
    test
}, yargs(), 'browser.only > ')

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
