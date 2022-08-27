export const lastFive: KeyboardEvent[] = []
export const makeGetLastN = () => {

    return (elem: HTMLElement | true, n: number) => {
        // needs to be redone as more of a state machine

        const lastTwo = lastFive.slice(lastFive.length - n).reduce((accum: string, ke: KeyboardEvent, idx: number) => {
            // browser-only above line
            if (ke.type !== 'keydown') {
                if ((ke as any).sequence === undefined) {
                    console.log('rejecting key; type', ke, 'type is ', ke.type)
                    return accum
                }
            }


            if (elem !== true) {
                if (elem !== ke.target) return accum
            }

            // browser only has key, not server
            if (typeof ke.key === 'string' || typeof ke.key === 'number') {

                return `${accum}-${ke.key}`
            }
            // ------------------------------------------------------------------(may be broken)
            // Server
            // server has 'sequence' and handles alt, etc, differently
            if (typeof (ke as any).sequence === 'string') {

                const keAsAny = (ke as unknown) as {
                    meta: boolean
                    ctrl: boolean
                    shift: boolean
                    sequence: string
                    name: string
                }
                let ret = accum ?? ''

                const CTRL = keAsAny.ctrl && !ret.includes('-Control') ? '-Control' : ''
                const META = keAsAny.meta && !ret.includes('-Alt') ? '-Alt' : ''
                const SHIFT = keAsAny.shift && !ret.includes('-Shift') ? '-Shift' : ''

                const nm = keAsAny.name && keAsAny.name.length === 1 && keAsAny.shift
                    ? keAsAny.name.toUpperCase()
                    : keAsAny.name

                const totSpecial = (CTRL ? 1 : 0) + (META ? 1 : 0) + (SHIFT ? 1 : 0)


                const pass = `${CTRL}${META}${SHIFT}`
                const prev = ret.split('-').filter(x => !!x)
                prev.push(nm)
                const finalPrev = prev.slice(0 + totSpecial, prev.length)
                let final = `${pass}-${finalPrev.join('-')}`
                return final

            }
        }, '')

        return lastTwo
    }
}
