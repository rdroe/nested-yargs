import { Terminal } from 'xterm';
import { Result } from '../../../appTypes';
import { ReadlineInterface, RenewReader, HistoryListener } from '../../dynamic'
import { FitAddon } from 'xterm-addon-fit'

const terminal: (ReadlineInterface & {
    attachCustomKeyEventHandler: Function,
    buffer?: any
    prompt: Function
    writeln: Function,
})[] = []

const outputForPasting = (strs: string[]) => {
    let ln = strs.shift()

    terminal[0].writeln(ln, () => {
        if (strs.length) {
            outputForPasting(strs)
        }
    })

}

const getLastTwo = () => {

    const lastFive = state.get('lastFive')
    console.log('last five', lastFive)
    const lastTwo = lastFive.slice(lastFive.length - 2).reduce((accum: string, ke: KeyboardEvent) => {
        if (ke.type !== 'keydown') {
            return accum
        }

        return `${accum}-${ke.key}`
    }, '')
    console.log('last two', lastTwo)
    return lastTwo
}

const state = new Map<any, any>()

state.set('lastFive', [])

type TerminalAugmented = InstanceType<typeof Terminal> & {
    prompt: Function
    writeln: Function
    attachCustomKeyEventHandler: InstanceType<typeof Terminal>['attachCustomKeyEventHandler']
    buffer?: any

};

const newTermPrompt = (term: TerminalAugmented, pr: string): ReadlineInterface & {
    readonly line: string,
    attachCustomKeyEventHandler: Function,
    buffer: any,
    prompt: Function,
    writeln: Function,

} => {

    term.prompt = function(pr1 = pr) {
        term.write('\r\n' + pr1);
    };
    let cmd = '';

    /*
    (term as any).onData(async (str: string) => {
        console.log('onData 131', typeof str)
        const lastTwo = getLastTwo()
        console.log('last two 131', lastTwo)
        if (lastTwo === '-Meta-v' || lastTwo === '-Control-v') {
            if (typeof str === 'string') {
                console.log('outputing', str)
                term.paste(str)
            } else {
                throw new Error('Non-string data passed to terminal')
            }
        }

    });
    */
    /*
    term.paste = (data) => {
        console.log('write transplant', data); term.write(data)
        }
        */
    return {
        get line() {
            return cmd
        },
        set line(arg: string) {
            cmd = arg
        },
        close: () => { },
        write: (str: string) => {
            term.write(str)
        },
        attachCustomKeyEventHandler: (arg1: (ev: KeyboardEvent) => boolean) => term.attachCustomKeyEventHandler(arg1),
        buffer: term.buffer,
        question: (pr1: string, fn: Function) => {
            return new Promise((resolve) => {

                term.prompt(pr1)
                let disposable = term.onKey(function({ domEvent: ev, key }) {
                    const printable = (
                        !ev.altKey && !ev.ctrlKey && !ev.metaKey
                    );

                    if (ev.key === 'ArrowUp' || ev.key === 'ArrowDown') {

                    } else if (ev.ctrlKey && ev.code === "KeyV" && ev.type === "keydown") {
                        navigator.clipboard.readText()
                            .then(text => {
                                term.write(text);
                            })
                    } else if (ev.keyCode == 13) {
                        if (cmd === 'clear') {
                            term.clear();
                        }
                        disposable.dispose()
                        const result = fn(cmd)
                        cmd = '';
                        return resolve(result)
                    } else if (ev.keyCode == 8) {
                        if (term.cols > 2) {

                            term.write('\b \b');
                            cmd = cmd.substr(0, cmd.length - 1)
                        }
                    } else if (printable) {
                        cmd += key;
                        term.write(key);
                    }
                })
            })
        },
        prompt: (pr1: string = pr) => {
            term.prompt(pr1)
        },
        writeln: (str: string, fn: () => void) => {
            term.writeln(str, fn)
        }
    }
}

export const historyListener: HistoryListener = {
    on: (keydown: string, fn: (_: any, kbe: KeyboardEvent) => boolean) => {
        if (keydown !== 'keydown') {
            throw new Error('historyListener is only made for "keydown" kind of node readline spoofing.')
        }

        terminal[0].attachCustomKeyEventHandler((arg: KeyboardEvent) => {
            console.log('attached custom fired')
            const lastFive = state.get('lastFive')
            lastFive.push(arg)
            if (lastFive.length === 6) {
                lastFive.shift()
            }

            return fn(null, arg)
        })


    }
}

export const terminalUtils = {
    matchUp: (obj: any) => {
        return obj.key === 'ArrowUp'
    },
    matchDown: (obj: any) => {
        return obj.key === 'ArrowDown'
    },

    eventName: 'keydown',
    clearCurrent: (rl: { write: Function }) => {

        const { x, y } = terminal[0].buffer._core.coreService._bufferService.buffers._activeBuffer
        const len = x - 'nyargs > '.length
        let cnt = 0
        terminal[0].line = ''
        while (cnt < len) {
            terminal[0].write('\b \b');
            cnt += 1
        }

    }
}


const output = (indent: string, strs: (string | number)[]): Promise<void> => {
    return new Promise((resolve) => {

        const output_ = () => {
            let ln = strs.shift()
            terminal[0].writeln(indent + ln, () => {
                if (strs.length) {
                    output_()
                } else {
                    resolve()
                    return
                }
            })
        }
        output_()
    })
}



export const renewReader: RenewReader = async (
    shellPrompt: string) => {

    if (terminal[0]) return terminal[0]
    // curElement?.close()
    // var term = new Terminal() as TerminalAugmented
    // terminals.set(term, new Map())

    const term = new Terminal({ fontSize: 10 }) as TerminalAugmented
    console.log('attaching')

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)

    const htmlElem = document.querySelector('#terminal')
    if (!htmlElem) throw new Error('Bad html selector')
    term.open(htmlElem as HTMLElement)
    terminal[0] = newTermPrompt(term, shellPrompt)
    return terminal[0]
}
// todo: i don't actually thing this needs to be async
const print = async (arg: string | number | object) => {

    const printable = typeof arg === 'object' ? JSON.stringify(arg, null, 2).split('\n') : [arg]
    await output(' '.repeat('nyargs > '.length), printable)
}



export const printResult = async (result: Result): Promise<boolean> => {

    if (result.argv.help === true) {
        return false
    }
    print('')
    if (!result.isMultiResult) {
        await print(result)
        return true
    } else {
        let didPrint = false
        await Promise.all(Object.entries(result.list).map(async ([idx, res]) => {
            didPrint = true
            await print(`${idx} result:`)
            await print(res)
            if (result.argv[idx].logArgs === true) {
                await print(`${idx} computed arguments:`)
                await print(result.argv[idx])
                await print('all args:')
                await print(result)
            }
        }))
        return didPrint
    }
}
