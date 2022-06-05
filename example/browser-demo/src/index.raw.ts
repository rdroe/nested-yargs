import { Terminal } from 'xterm';

type TerminalAugmented = InstanceType<typeof Terminal> & {
    prompt: Function
};

const newTermPrompt = (term: TerminalAugmented, pr: string): {
    readonly line: string,
    write: Function,
    close: Function,
    question: Function,
    clear: Function
    instance: Promise<string>,
    historyListener: {
        on: Function
    }
} => {

    term.prompt = function() {
        term.write('\r\n' + pr);
    };

    term.prompt();

    var cmd = '';
    return {
        line: cmd,
        close: () => { },
        write: (str: string) => term.write,
        question: (pr: string, forwarded?: string): any => undefined,
        clear: term.clear,
        instance: new Promise((resolve) => {
            let disposable = term.onKey(function({ domEvent: ev, key }) {
                var printable = (
                    !ev.altKey /* && !ev.altGraphKey */ && !ev.ctrlKey && !ev.metaKey
                );
                // const { x, y } = (term.buffer as any)._core.coreService._bufferService.buffers._activeBuffer

                if (ev.keyCode == 13) {
                    if (cmd === 'clear') {
                        term.clear();
                    }
                    disposable.dispose()
                    // cmd = '';
                    return resolve(cmd);
                } else if (ev.keyCode == 8) {

                    if (term.cols > 2) {
                        term.write('\b \b');
                    }
                } else if (ev.metaKey) {

                } else if (printable) {
                    cmd += key;
                    term.write(key);
                }
            })
        }),
        historyListener: {
            on: (keydown: string, fn: (kbe: KeyboardEvent) => boolean) => {
                if (keydown !== 'keydown') {
                    throw new Error('historyListener is only made for "keydown" kind of node readline spoofing.')
                }
                term.attachCustomKeyEventHandler(fn)
            }
        }

    }
}



export const setUp = (elem: HTMLElement, terminals: Map<any, any>, shellprompt: string = 'nyargs > '): {
    getInput: (pr: string, forwarded?: string) => Promise<string>
} => {

    var term = new Terminal() as TerminalAugmented

    terminals.set(term, new Map())
    const state = terminals.get(term)
    state.set('lastFive', [])
    term.open(elem);

    const indent = ' '.repeat(shellprompt.length)

    // log output
    const output = (strs: string[]) => {
        let ln = strs.shift()
        term.writeln(ln, () => {
            if (strs.length) {
                term.write(indent)
                output(strs)
            } else {
                term.prompt()
            }
        })

    }

    term.prompt = function() {
        term.write('\r\n' + shellprompt);
    };


    // term.prompt();
    term.setOption('cursorBlink', true);

    const getLastTwo = () => {
        const lastFive = state.get('lastFive')
        const lastTwo = lastFive.slice(lastFive.length - 2).reduce((accum: string, ke: KeyboardEvent) => {
            if (ke.type !== 'keydown') {
                return accum
            }
            return `${accum}-${ke.key}`
        }, '')

        return lastTwo
    }

    term.attachCustomKeyEventHandler((keyboardEvent) => {
        console.log('keyboardEvent', keyboardEvent)
        const lastFive = state.get('lastFive')
        lastFive.push(keyboardEvent)
        if (lastFive.length === 6) {
            lastFive.shift()
        }
        return true
    })

    term.onData(async (str) => {
        const lastTwo = getLastTwo()
        if (lastTwo === '-Meta-v') {
            term.paste(str)
        }
    })

    term.paste = (data) => {
        if (typeof data === 'string') {
            output(data.split('\r'))
        } else {
            throw new Error('Non-string data passed to terminal')
        }
    }

    return {
        getInput: async (newPrompt: string, forwarded?: string): Promise<string> => {
            if (forwarded) { term.write(forwarded) }
            return newTermPrompt(term, newPrompt).instance
        }
    }
}

export default setUp

