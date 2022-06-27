import fetch from 'isomorphic-fetch'

export type SaveRequest = {
    [key: string]: string | number | object
}

export const EP_BRACKETS = 'brackets'

export interface QueryParams {
    [key: string]: string | number
}

export interface postCall {
    (ep: string, params: SaveRequest, options?: RequestInit): Promise<Response>
}

export interface getCall {
    (ep: string, params: QueryParams, options?: RequestInit): Promise<Response>
}

async function postData(url = '', data: SaveRequest, options: RequestInit) {
    // Default options are marked with *
    const response = await fetch(url, {
        ... {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify({ data })
        }, ...options
    });
    return response.json(); // parses JSON response into native JavaScript objects
}

export const post: postCall = (rqBase: string, queryParams: SaveRequest, options: RequestInit = {}) => {
    return postData(rqBase, queryParams, options)
}

export const get: getCall = (rqBase: string, queryParams: QueryParams, options: RequestInit = {}) => {
    const concattedParams: string = Object.entries(queryParams).reduce(
        (accum: string, [key, val]: [string, string | number]) => {

            const separator = accum ? '&' : '?'
            return `${accum}${separator}${key}=${val}`
        }, '')
    const fetchCall = fetch(`${rqBase}${concattedParams}`, options)
    console.log('return from fetch', fetchCall)
    return fetchCall
}

