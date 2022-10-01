import { createApp } from 'nyargs'
import { program, } from 'nyargs/br'
import box from './commands/box'
import torus from './commands/torus'
import { runRenderLoop } from './ui/engine'

export const app = async () => {

    await createApp({
        box,
        torus,
        // aliases
        pr: program,
        pro: program,
        prog: program,
    }, {
        programs: {
            matchTwos: [
                'match scalar -l 22 2 202 -r 22 2022, 202'
            ]
        },
    }, '3d > ')
    runRenderLoop()
}
