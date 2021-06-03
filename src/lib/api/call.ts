
import { RequestOptions } from 'http'
import fetch from 'isomorphic-fetch'
const DOMAIN_DEFAULT = 'http://localhost:8080'

export const EP_BRACKETS = 'brackets'

export interface QueryParams {
    [key: string]: string | number
}

interface fetchCall {
    (ep: string, params: QueryParams, options?: RequestInit): Promise<Response>
}

// Example POST method implementation:
async function postData(url = '', data = {}, options = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
        ... {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        }, ...options
    });
    return response.json(); // parses JSON response into native JavaScript objects
}

export const callApi: fetchCall = (ep: string, queryParams: QueryParams, options: RequestInit = {}) => {
    const rqBase = `${DOMAIN_DEFAULT}/${ep}`
    if (options.method && options.method.toLowerCase() === 'post') {
        return postData(rqBase, queryParams, options)
    }
    const concattedParams: string = Object.entries(queryParams).reduce(
        (accum: string, [key, val]: [string, string | number]) => {

            const separator = accum ? '&' : '?'
            return `${accum}${separator}${key}=${val}`
        }, '')
    console.log('concatted;', concattedParams)

    return fetch(`${rqBase}${concattedParams}`, options)
}

