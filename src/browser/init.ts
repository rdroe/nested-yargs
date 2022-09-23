

export default () => {

    document.head.innerHTML += `
<!-- Injected by nyargs -->
<style>
:root {
    --main-bg-color: #0F230F;
    --main-text-color: aliceblue;
}

html {
    box-sizing: content-box;
}

body {
    background-color: var(--main-bg-color);
}
.text-area-container {
    position: fixed;
    right: 0;
    width: 35%;
    height: 10%;
    color: var(--main-text-color);
}

.print-area {
    position: fixed;
    top: 0;
    height: 100%;
    overflow: scroll;
    color: var(--main-text-color);
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
    color: var(--main-text-color);
}

</style>`

    document.body.innerHTML += `
<div id="terminal"></div>`
}
