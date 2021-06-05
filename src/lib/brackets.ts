
import { callApi, EP_BRACKETS } from './api/call'
import { QueryParams } from './api/call'

export interface SaveRequest {
    brackets: string
    destination_roebook: string,
    sent_at: number
}


export const parse = (snt: string) => {
    return callApi(EP_BRACKETS, { snt: snt.split(' ').join('-') })
}


export const save = ({ data }: { data: SaveRequest }) => {
    return callApi(EP_BRACKETS, data, { method: 'POST' })
}
