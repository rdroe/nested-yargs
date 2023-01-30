import { keyListenerUtil } from '.'
import { Scanner } from './types'
import { getUserTables } from 'browser/db'
import { fakeCli } from 'runtime/input'
import { num } from 'shared/utils/validation'



type IDX = {
    group: 'a',
    mesh: 'b',
    group2: 'c',
    x: 'd',
    y: 'e',
    z: 'f',
    id: 'g',
    instance: 'h'
}

const IDX: IDX = {
    group: 'a',
    mesh: 'b',
    group2: 'c',
    x: 'd',
    y: 'e',
    z: 'f',
    id: 'g',
    instance: 'h'
}

type BoxOrPlaneIdxs = {
    table: 'bracketsGet'
    [IDX.group]: number | string
    [IDX.mesh]: number | string
    [IDX.group2]: number | string
    [IDX.x]: number | string
    [IDX.y]: number | string
    [IDX.z]: number | string
    [IDX.id]: number | string
    [IDX.instance]: number | string
    id: number
}

type BoxOrPlane = Partial<BoxOrPlaneIdxs> & {
    data: {
        random: number
    }
}

type BoxesAndPlanes = BoxOrPlane[]
let cursor: number

const isParseData = (arg: any) => true
const isBoxOrPlaneArr = (arg: any): arg is BoxOrPlane[] => true

const typingOne = (arg: any): arg is { argv: any, list: any[] } => {
    if (arg.argv === undefined) return false
    if (!arg.list || !arg.list['brackets get']) return false
    return true
}

const validateBoxesAndPlanes = (boxesAndLines: { data: any, table?: string }[]): boxesAndLines is BoxesAndPlanes => {

    let isValid = true
    boxesAndLines.forEach((arg) => {
        if (arg.table !== 'bracketsGet') { isValid = false }
        if (!arg.data['cli'] || !arg.data['color']) { isValid = false }
    })
    return isValid
}

export const scanner: Scanner = {
    allow: 'match scalar',
    cliIds: 1,
    throttle: 1500,
    init: async () => {

        const userTables = await getUserTables()
        const allBoxes = await userTables.where('bracketsGet',
            { [IDX.mesh]: 'box' })

        const boxArray = await allBoxes.toArray()
        const zs = boxArray.reduce((accum: number[], arg: { [IDX.z]?: string | number }) => {

            if (typeof arg[IDX.z] !== 'number') return accum
            return [...accum, num.parse(arg[IDX.z])]
        }, [] as number[])
        cursor = zs.length ? Math.max(...zs) : 0
    },
    preprocess: (cliStr: string | null) => {

        return cliStr
    },
    fn: async function bracketsGet(kbEv, curReadline, taId, sca) {

        const userTables = await getUserTables()
        const { render, setCrudHandler, raw, cli } = keyListenerUtil<BoxOrPlane[]>(kbEv, curReadline, taId, sca)
        // data operation (including caching) on keypress matching this scanner   
        setCrudHandler(async function updateBracketsGet() {

            // look up already parsed data
            const cached = await (await userTables.where('bracketsGet', { [IDX.group]: raw })).toArray()


            if (cached.length) {
                const last = cached[cached.length - 1]

                const boxesAndLines = cached.filter((arg) => {

                    if (arg.table !== 'bracketsGet') return false
                    if (!arg.data['cli'] || !arg.data['color']) return false

                    if (arg[IDX.z] === last[IDX.z]) {
                        return true
                    }
                    return false
                })

                if (isBoxOrPlaneArr(boxesAndLines)) {
                    return boxesAndLines
                }
                throw new Error(`Malformed boxes and lines`)

            }

            // this snt is not already parsed; run the stanford parser
            const result = await fakeCli.handle(cli)

            // sanity check
            if (!typingOne(result)) {
                throw new Error('Expected a {argv, list, ...} pattern; instead:' + JSON.stringify(result, null, 2).substring(0, 200))
            }
            // shuck from husk
            const data = result.list['match scalar']

            // sanity 2
            if (!isParseData(data)) {
                throw new Error('Expected a {argv, list, ...} pattern; instead:' + JSON.stringify(result, null, 2).substring(0, 200))
            }

            const boxesAndPlanes = [{ a: 'rand', data: { random: Math.round(Math.random() * 100000) } }]

            boxesAndPlanes.forEach((boxOrPlane) => {
                userTables.add('bracketsGet', boxOrPlane)
            })

            return boxesAndPlanes
        })

        // what to do with that data

        render(async function renderBracketsGet(boxesAndPlanes) {
            console.log('render', boxesAndPlanes)
            boxesAndPlanes.forEach((bOrP: BoxOrPlane) => {

                fakeCli.handle(`match scalar -l ${bOrP.data.random} -r ${bOrP.data.random}`)

            })
        }, (e) => {
            console.error(e.message)

        })
        return true
    }
}
