import { deps, Readline } from '../dynamic'

let curReadline: ReturnType<Readline['createInterface']>
let didInitHistory = false

type FnGetInput = (pr: string, initialInput?: string) => Promise<string>

let _getInput: Promise<FnGetInput>

const histState: {
    hist: string[],
    idx: number,
    line?: string
} = {
    hist: [],
    idx: 0,
    line: undefined
}

// export const triggerInput = makeTriggerInput((curReadline.write as (str: string) => void))

const initHistory = (clearCurrent: Function, write: Function, historyListener: { on: Function }, histState: { hist: string[], idx: number, line?: string }, utils: { matchUp: Function, matchDown: Function, eventName: string }) => {

    const { matchUp, matchDown, eventName } = utils
    historyListener.on(eventName, (_: any, obj: any) => {
        if (obj.type && obj.type !== eventName) {
            return
        }
        // if the up arrow is pressed, clear the current terminal contents.
        if (matchUp(obj)) {
            console.log('matched up')
            // if we are at the extent of history 
            if (histState.idx === histState.hist.length) {
                // push in the current contents.
                histState.hist.push(histState.line)
            }

            // clear current and...
            clearCurrent(curReadline)
            // back up the ticker 
            histState.idx = Math.max(0, histState.idx - 1)
            // and write to cursor the new one
            write(histState.hist[histState.idx])
        } else if (matchDown(obj)) {
            // if down arrow, add one (but hold at length - 1)
            console.log('matched down')
            histState.idx = Math.min(histState.hist.length - 1, histState.idx + 1)
            // clear, then write
            clearCurrent(curReadline)
            write(histState.hist[histState.idx] ?? '')
        }
    })
}

export const getInput: FnGetInput = async (pr, initInput = '') => {

    const renewReader = await deps.get('renewReader')
    const utils = await deps.get('terminalUtils')
    const { clearCurrent } = utils

    if (!_getInput) {
        _getInput = makeGetInput()
    }

    if (!curReadline) {
        curReadline = await renewReader(pr, curReadline) // dep: renewReader
    }

    if (!didInitHistory) {
        didInitHistory = true
        const historyListener = await deps.get('historyListener')

        initHistory(() => {
            clearCurrent(curReadline)
        }, (...args: any[]) => curReadline.write(...args), historyListener, histState, utils)



    }

    const fn = await _getInput
    return fn(pr, initInput)
}

const makeGetInput = async () => {

    if (_getInput) return _getInput

    const readline =
        await deps.get('readline')

    const renewReader = await deps.get('renewReader')

    if (readline.getInput) return readline.getInput

    // should run in server only.... create the interface.
    // this is called repeatedly, with each destroyed to tightly control the timing of the prompt presentation.

    return async (pr: string, initialInput: string = ''): Promise<string> => {

        curReadline = await renewReader(pr, curReadline)
        if (initialInput) {
            curReadline.write(initialInput)
        }

        const userInput = await new Promise<string>((res) => {
            curReadline.question(pr, (inp: string) => {
                histState.hist.push(inp)
                curReadline.close()
                histState.idx = histState.hist.length
                return res(inp)
            })

        })
        return userInput

    }
}
