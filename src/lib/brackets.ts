
import fetch from 'isomorphic-fetch'

export const parse = (snt: string) => {
    const arg = snt.split(' ').join('-')
    const path = `http://localhost:8080/brackets?snt=${arg}`
    return fetch(path)
}
