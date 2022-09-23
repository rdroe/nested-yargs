// import { stdin as input, stdout as output } from 'node:process'
import { exec as syncExec, spawn } from 'child_process'
import { ChildProcessWithoutNullStreams } from 'node:child_process';
const util = require('node:util');
const exec = util.promisify(syncExec)

const log = console.log
const awaitExit = async (runningProc: ChildProcessWithoutNullStreams, nextStepCheck: null | string) => {
    const codeMsg = (code: number) => 'child process exited with code ' + code.toString()
    const tryNextStep = (stdio: string) => {

        if (nextStepCheck !== null) {
            console.log('checking for', nextStepCheck, ' in ', stdio)
            if (stdio.includes(nextStepCheck)) {
                return true
            }
        }
        return false
    }

    const nextStepHandler = (data: { toString: () => string }) => {

        const stdio = data.toString()
        const done = tryNextStep(stdio)
        if (done) return { msg: 'Going to next program step.' }
        return false
    }

    runningProc.stderr.on('data', nextStepHandler)
    runningProc.stdout.on('data', nextStepHandler)
    runningProc.on('exit', (code) => {
        log('(on exit)', codeMsg(code))
        return { msg: codeMsg(code) }
    })

    runningProc.on('error', (code: number) => {
        log('(on error)')
        console.error(codeMsg(code))
        return { err: codeMsg(code) }
    })
}


export const loggingExec = async ([cmd, args = []]: [string, string[]], {
    onLog = log,
    onError = console.error,
    nextStepCheck = null
}) => {

    try {

        const spawned = spawn(cmd, args)
        spawned.stdout.on('data', function(data) {
            const stdout = data.toString()
            onLog(stdout)
        });

        spawned.stderr.on('data', function(data) {
            const stderr = data.toString()
            onError(stderr)

        });

        return awaitExit(spawned, nextStepCheck)

    } catch (e) {
        console.error(`could not run ${cmd}: ${e.message}`)
    }
}
