import { cli, grn } from '../src/shared/utils/cli'
import * as readline from 'readline';
import { stdin as input, stdout as output } from 'node:process'
import { loggingExec } from '../src/server/cliUtils/metaHelpers'

let targetDir: string

const defaultProjName = 'nya-prolog-app'
const msg = console.log
cli(`echo "node 16+ is required"`)
    .cli(`node --version`)
    .replace((result: string) => {
        const parsedMajor = parseInt(result.replace('v', ''), 10)
        msg(`installed version: ${result}`)
        if (parsedMajor < 16) return null
        return `cd ../.. && pwd`
    })
    .replace(async (workingDir) => {
        const defaultDir = `${workingDir.trim()}/${defaultProjName}`
        const grnDefault = grn(`(default is ${defaultDir})`)
        let userInput: string
        const rl = readline.createInterface({ input, output })
        try {
            await new Promise<void>((res, rej) => {


                rl.question(`enter target directory for the new example ${grnDefault}: `, (inp: string) => {
                    if (typeof inp === 'string') {
                        userInput = inp

                        return res()
                    }
                    return rej(`Could not get valid user input`)

                })
            })
            rl.close()
        } catch (e) {
            rl.close()
            console.error(`Error; ${e.message}`)
        }


        if (!userInput) {
            targetDir = defaultDir
        } else {
            targetDir = userInput
        }

        return `echo 'set target dir to "${targetDir}"'`
    })
    .wait(() => {
        msg('waited', targetDir)
        return `echo "target dir on delete is ${targetDir}/"
rm -rf ${targetDir}
cp -r codes/prolog ${targetDir}/`

    })
    .replace(() => {
        msg('changing directory', targetDir)
        process.chdir(targetDir)
        return `yarn set version berry`
    }).replace((prior) => {
        msg('curr node directory:', process.cwd())
        return `echo "${prior} ; starting install...."
pwd
yarn
`
    }).replace(() => {
        msg('finished yarn install')
        return `yarn ts-build`
    }).replace(() => {
        msg('finished ts-build')
        return `yarn js-build`
    }).replace(async () => {
        return `yarn mon-all`
    })



