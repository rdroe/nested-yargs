
import { callApi, EP_BRACKETS } from './api/call'
import { QueryParams } from './api/call'

export const parse = (snt: string) => {
    return callApi(EP_BRACKETS, { snt: snt.split(' ').join('-') })
}


export const save = (data: QueryParams) => {
    return callApi(EP_BRACKETS, data, { method: 'POST' })
}
