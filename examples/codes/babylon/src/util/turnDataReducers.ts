type LegData = (string | [string, any])[]
type GameTurnData = {
    [gameId: number]: {
        [turn: string]: {
            [legId: string]: any[]
        }
    }
}

export type PilotData = {
    [gameId: number]: {
        [turn: string]: {
            [piName: string]: {
                location: [number, number, number]
            }
        }
    }
}

type OsData = {
    location: [number, number, number]
}

export type OsGameData = {
    [gameId: number]: {
        [osName: string]: OsData
    }
}

const legLookup = (llarg1: string, turnDat: LegData) => {

    const lookup = turnDat.find((datum: string | [string, any]) => {
        // on empty string, return the bare string (doesn't work)
        if ((typeof datum === 'string') && llarg1.length === 0) {
            console.log('returning as name', datum)
            return true
        }

        const name = (typeof datum === 'string') ? datum : datum[0]

        console.log('name settled on', name.startsWith(llarg1))
        const ret = name.startsWith(llarg1)
        console.log('matched?', ret)
        return ret
    })

    const returnable = lookup && Array.isArray(lookup) ? lookup[1] : lookup ?? null

    return returnable
}

export const osData = (gameId: number, gamesData: OsGameData) => (turnDat: any[]): OsGameData | null => {

    if (typeof gamesData !== 'object') throw new Error(`Expected an object for ongoing game data.`)

    if (!Array.isArray(turnDat)) throw new Error(`Expected array to create lines`)

    const init = gamesData[gameId] || {} as { [os: string]: OsData }

    const reducedIntoInit = turnDat.reduce((accum: { [os: string]: OsData }, turnLegs) => {

        const retVal = { ...accum }

        turnLegs.forEach((turnLeg: LegData) => {

            const location = legLookup('location', turnLeg)
            const os: string =
                turnLeg.find((elem) => typeof elem === 'string') as string

            if (location === null || os === null) throw new Error(`could not find os name, term "location" or  some combination in ${JSON.stringify(turnLeg, null, 2)}`)
            console.log('location', location)
            const osDat: OsData = { location }

            retVal[os] = retVal[os] ? { ...retVal[os], ...osDat } : osDat


        })

        return {
            ...accum, ...retVal
        }
    }, init)

    return { ...gamesData, [gameId]: reducedIntoInit }


}


export const pilotData = (gameId: number, gamesData: any) => (turnDat: any[]): PilotData | null => {
    console.log('args', gamesData, turnDat)
    if (typeof gamesData !== 'object') throw new Error(`Expected an object for ongoing game data.`)

    if (!Array.isArray(turnDat)) throw new Error(`Expected array to create lines`)

    const init = (gamesData[gameId] ?? {}) as GameTurnData

    const reducedIntoInit = turnDat.reduce((accum: GameTurnData, turnLegs, turnIdx) => {

        const retVal = { ...accum }

        turnLegs.forEach((turnLeg: LegData) => {

            const turn = legLookup('turn', turnLeg)
            const pilotName: string =
                turnLeg.find((elem) => typeof elem === 'string') as string

            const location = legLookup('location', turnLeg)

            const os = legLookup('os', turnLeg)

            if (turn === null || pilotName === null || location === null || os === null) throw new Error(`could not find pilot name, turn, "current", or os or some combination in ${JSON.stringify(turnLeg, null, 2)}`)

            retVal[turn] = retVal[turn] ?? {}
            retVal[turn][pilotName] = retVal[turn][pilotName] ?? {}
            retVal[turn][pilotName].location = location


        })

        return {
            ...accum, ...retVal
        }
    }, init)

    return { ...gamesData, [gameId]: reducedIntoInit }


}

export const linesFromTurnData = (
    gameId: number,
    gamesData: any = {}) => (turnDat: any[]): GameTurnData | null => {

        if (typeof gamesData !== 'object') throw new Error(`Expected an object for ongoing game data.`)

        if (!Array.isArray(turnDat)) throw new Error(`Expected array to create lines`)

        const init = (gamesData[gameId] ?? {}) as GameTurnData

        const reducedIntoInit = turnDat.reduce((accum: GameTurnData, turnLegs, turnIdx) => {

            const retVal = { ...accum }

            turnLegs.forEach((turnLeg: LegData) => {

                const turn = legLookup('turn', turnLeg)
                const legId = legLookup('leg', turnLeg)


                if (turn === null || legId === null) throw new Error(`could not find turn, leg,  or some combo, in ${JSON.stringify(turnLeg, null, 2)}`)

                retVal[turn] = retVal[turn] ?? {}
                const turnList = retVal[turn]
                turnList.legPaths = turnList.legPaths ?? {}
                retVal[turn][legId] = retVal[turn][legId] ?? {}


            })

            return {
                ...accum, ...retVal
            }
        }, init)

        return { ...gamesData, [gameId]: reducedIntoInit }
    }


type LegsWithTurns = {
    [lid: string]: {
        [num: number]: [number, number, number]
    }
}

export const legsWithTurns = (turnDat: any[]): LegsWithTurns | null => {

    if (typeof turnDat !== 'object') throw new Error(`Expected an object for ongoing game data.`)

    if (!Array.isArray(turnDat)) throw new Error(`Expected array to create lines`)

    const reducedToObj = turnDat.reduce((accum: LegsWithTurns, turnLegs, turnIdx) => {

        turnLegs.forEach((turnLeg: LegData) => {
            console.log('turnLeg', turnLeg)
            const turn = legLookup('turn', turnLeg)
            const legId = legLookup('leg', turnLeg)
            const current = legLookup('current', turnLeg)

            if (turn === null || legId === null || current === undefined) {
                throw new Error(`could not find turn, leg,  or some combo, in ${JSON.stringify(turnLeg, null, 2)}`)
            }
            if (current === 'null') return
            // initialize leg with turns
            console.log('setting data', turn, legId, current)
            const leg: { [num: number]: [number, number, number] } = accum[legId] ?? {}
            // leg[turn] = current
            console.log('leg before', accum[legId])
            accum[legId] = { ...accum[legId] ?? {}, [turn]: current }
            console.log('leg', leg)
            console.log('outgoing', accum[legId])
        })

        return accum

    }, {})
    return reducedToObj
}


type PilotsWithTurns = {
    [pid: string]: {
        [num: number]: [number, number, number]
    }
}


export const pilotsWithTUrns = (turnDat: any[]): PilotsWithTurns | null => {

    if (typeof turnDat !== 'object') throw new Error(`Expected an object for ongoing game data.`)

    if (!Array.isArray(turnDat)) throw new Error(`Expected array to create lines`)

    const reducedToObj = turnDat.reduce((accum: PilotsWithTurns, turnLegs) => {
        turnLegs.forEach((turnLeg: LegData) => {
            const turn = legLookup('turn', turnLeg)
            const piName: string =
                turnLeg.find((elem) => typeof elem === 'string') as string
            const location = legLookup('location', turnLeg)

            if (turn === null || piName === null) throw new Error(`could not find turn, leg,  or some combo, in ${JSON.stringify(turnLeg, null, 2)}`)

            const leg: { [num: number]: [number, number, number] } = accum[piName] ?? {}
            leg[turn] = location
            accum[piName] = leg
        })

        return accum

    }, {})
    return reducedToObj
}



// export const edges = () => 
