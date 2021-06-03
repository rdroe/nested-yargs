
import fetch from 'isomorphic-fetch'
const DOMAIN_DEFAULT = 'http://localhost:8080'

export const EP_BRACKETS = 'brackets'

interface QueryParam {
    key: string,
    val: string
}

export const callApi = (ep: string, param: QueryParam) => {
    const path = `${DOMAIN_DEFAULT}/${ep}?${param.key}=${param.val}`
    return fetch(path)
}
