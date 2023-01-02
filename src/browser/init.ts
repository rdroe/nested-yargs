
export const cssMonikers = {
    nyargsCli: 'nya-textarea',
    isOffscreen: 'nya-is-offscreen',
}

export const classesByName = (id: number) => ({
    promptText: [`nya-prompt-text`, `nya-prompt-text-${id}`],
    printArea: [`nya-print-area`, `nya-print-area-${id}`],
    printAreaText: [`nya-print-area-text`, `nya-print-area-text-${id}`],
    textareaContainer: [`nya-container`, `nya-container-${id}`],
    textarea: [`${cssMonikers.nyargsCli}`, `${cssMonikers.nyargsCli}-${id}`]
})

export const idsByName = (id: number) => ({
    textarea: `${cssMonikers.nyargsCli}-${id}`,
    textareaContainer: `nya-container-${id}`
})

export default () => {
    document.head.innerHTML += `
<!-- Injected by nyargs -->
<style>
:root {
    --main-bg-color: #0F230F;
    --main-text-color: aliceblue;
}

* {
    box-sizing: border-box;
}

body {
    background-color: var(--main-bg-color);
}
.nya-container {
    overflow: visible;
    position: fixed;
    right: 0;
    width: 35%;
    height: 10%;
    color: var(--main-text-color);
}

.nya-print-area {
    position: fixed;
    top: 0;
    height: 100%;
    overflow: scroll;
    color: var(--main-text-color);
}

.nya-print-area-text {
    position: absolute;
    margin-bottom: 10vh;
}

.nya-print-area:not(.nya-is-offscreen) {
    width: 20vw;
    right: 0;
}

.nya-print-area.nya-is-offscreen {
    right: -100%;
}

.nya-print-area > pre {
    width: 100%;
    border-bottom-width: 9vh;
    border-bottom-color: transparent;
    box-sizing: border-box;
    border-bottom-style: solid;    
}

.nya-container.nya-is-offscreen {
    bottom: -100%;
}

.nya-container:not(.nya-is-offscreen) {
    bottom: 0;
}

.nya-textarea {
    height: 100%; 
    width: 100%;
    background-color: rgba(0, 0, 0, 50%);
    color: var(--main-text-color);
}

.nya-prompt-text {
    position: absolute; 
    right: 100%; 
    width: 100%; 
    top: 0; 
    display: flex; 
    justify-content: end;
}
</style>`

}
