import { RESULT_KEY } from "./const"
import { BaseArguments, Result } from "./types"

const strJson = (arg: any) => JSON.stringify(arg, null, 2)

export const getText = <T extends BaseArguments = BaseArguments>(argv: T, result: Result): string => {

    if (argv.help === true) {
        return ''
    }
    if (result.isMultiResult === false) {
        console.log(result[RESULT_KEY])
        return strJson(result[RESULT_KEY])
    } else {

        let accumTxt = ''
        Object.entries(result.list).forEach(([idx, res]) => {
            accumTxt = `${accumTxt}
${idx} result:
${strJson(res)}
`

            if (argv.logArgs === true) {
                accumTxt = `${accumTxt}
${idx} computed arguments:
${strJson(argv)}

all args:
${strJson(result)}`

            }
        })
        return accumTxt
    }
}


export const printResult = async <T extends BaseArguments>(argv: T, result: Result, optional?: any): Promise<boolean> => {
    if (argv.help === true) {
        return true
    }
    const txt = getText(argv, result)
    console.log(txt)
    return txt.length > 0
}
