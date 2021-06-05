
type ParseNode = any

export interface ParseData {
    action?: "FETCH_SUCCEEDED"
    sentence: string
    brackets: string
    data: Array<PosNode>
}


export interface PosNode {
    ancestor_ids: string[]
    ancestors: string[]
    brackets: string
    id: string
    internal_id: number
    is_pm: number
    parent_id: string
    sibling_order: number
    tag: string
    word: string
    x: number
    y: number
}

