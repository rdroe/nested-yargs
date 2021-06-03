
import { callApi, EP_BRACKETS } from './api/call'

export const parse = (snt: string) => {
    return callApi(EP_BRACKETS, { key: 'snt', val: snt.split(' ').join('-') })
}
