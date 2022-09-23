import { cache, match, element, nest, repl, program, test, setDictionary } from 'nyargs/br'
import { init } from 'nyargs/br'
import box from './commands/box'
import torus from './commands/torus'
import { runRenderLoop } from './ui/engine'

setDictionary({ 'matchTwos': ['match scalar -l 1 -r 1'] })

export const app = async (yargs: Function) => {
    init.default()
    runRenderLoop()
    return repl({
        cache,
        program,
        match,
        element,
        nest,
        test,
        box,
        torus,
        // aliases
        pr: program,
        pro: program,
        prog: program,
    }, yargs(), '3d > ')
}
