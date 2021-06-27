
import fetch from 'isomorphic-fetch'
import { DOMAIN_DEFAULT } from '../../bin/constants'

type SaveRequest = {
    key?: string | number
}

export const EP_BRACKETS = 'brackets'

export interface QueryParams {
    [key: string]: string | number
}

interface postCall {
    (ep: string, params: SaveRequest, options?: RequestInit): Promise<Response>
}

interface getCall {
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

export const post: postCall = (ep: string, queryParams: SaveRequest, options: RequestInit = {}) => {
    const rqBase = `${DOMAIN_DEFAULT}/${ep}`
    return postData(rqBase, queryParams, options)
}


export const callApi: getCall = (ep: string, queryParams: QueryParams, options: RequestInit = {}) => {
    const rqBase = `${DOMAIN_DEFAULT}/${ep}`
    const concattedParams: string = Object.entries(queryParams).reduce(
        (accum: string, [key, val]: [string, string | number]) => {

            const separator = accum ? '&' : '?'
            return `${accum}${separator}${key}=${val}`
        }, '')

    console.log('get request;', concattedParams)

    return fetch(`${rqBase}${concattedParams}`, options)
}

