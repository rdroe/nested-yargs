type LegData = (string | [string, any])[]
type GameTurnData = {
    [gameId: number]: {
        [turn: string]: {
            [legId: string]: any[]
        }
    }
}
