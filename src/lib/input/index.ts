import { deps, Readline } from '../../../index'

let curReadline: ReturnType<Readline['createInterface']>
const hist: string[] = []
let idx = hist.length
type FnGetInput = (pr: string, initialInput?: string) => Promise<string>

let _getInput: Promise<FnGetInput>

export const getInput: FnGetInput = async (pr, initInput = '') => {

    if (!_getInput) {
        _getInput = makeGetInput()
    }

    const fn = await _getInput
    return fn(pr, initInput)
}


const clearCurrent = (rl: ReturnType<Readline['createInterface']>) => {
    rl.write(null, { ctrl: true, name: 'u' });
}


export const triggerInput = (inp = "brackets get -s 'i go'") => {

    curReadline.write(inp)
    curReadline.write("\n")
}

export const makeGetInput = async () => {

    if (_getInput) return _getInput

    const readline = await deps.get('readline')

    // create the interface.
    // this is called repeatedly, with each destroyed to tightly control the timing of the prompt presentation.
    const reader = (pr: string) => {
        curReadline?.close()
        // todo: verify that readline module is totally garbage collected
        // on resetting the reference.
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: pr
        })
        return rl
    }

    // At the level of stdin, listen to keypress to control e.g. history, etc.
    process.stdin.on('keypress', (ch, obj) => {
        let rl = curReadline
        let name = obj.name || null
        if (name === 'up') {
            if (idx === hist.length) {
                hist.push(rl.line)
            }
            clearCurrent(rl)
            idx = Math.max(0, idx - 1)
            rl.write(hist[idx])
        } else if (name === 'down') {
            idx = Math.min(hist.length - 1, idx + 1)
            clearCurrent(rl)
            rl.write(hist[idx] ?? '')
        }
    })

    return (pr: string, initialInput: string = ''): Promise<string> => {
        curReadline = reader(pr)
        return new Promise((res) => {
            curReadline.question(pr, (inp: string) => {
                hist.push(inp)
                curReadline.close()
                idx = hist.length
                return res(inp)
            })
            if (initialInput) {
                curReadline.write(initialInput)
            }
        })
    }
}



/**

   readline.
   createInterface

   created object needs:
   write
   question
   close
*/

