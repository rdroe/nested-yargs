
import { callApi, post, EP_BRACKETS } from '../api/call'
import { SaveRequest } from './types'

export const parse = (snt: string) => {
    return callApi(EP_BRACKETS, { snt: snt.split(' ').join('-') })
}


export const save = (saveRequest: SaveRequest) => {
    return post(EP_BRACKETS, saveRequest, { method: 'POST' })
}
