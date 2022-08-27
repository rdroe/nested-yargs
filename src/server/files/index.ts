import { Files } from '../../shared/utils/types'
import { writeFile, readFile } from 'fs/promises'

/**
   read and write should have the param types of the node js file-system equivalents from fs/promises.
   however, the arguments passed must be of the kind to return string, or at runtime an error will occur. if the internal file system calls result in buffer, for example, these fail.
*/

const readPromise: Files['read'] = async (path, opts): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        const ret = await readFile(path, opts as BufferEncoding)
        if (typeof ret === 'string') {
            return resolve(ret)
        } else return reject(new Error(`Readfile should return a string.`))

    })
}



const writePromise: Files['write'] = async (data, encoding, nodeOnly): Promise<void> => {

    return new Promise(async (resolve, reject) => {
        let ret: Awaited<ReturnType<typeof writeFile>>
        // if a node-only 
        if (nodeOnly) {
            console.warn('warning; "files" is meant to be universal; but a  third argument to write will be ignored in the browser runtime.')
            ret = await writeFile(data, encoding, nodeOnly as Parameters<typeof writeFile>[2])
        } else {
            ret = await writeFile(data, encoding)
        }

        if (typeof ret === 'string') {
            return resolve(ret)
        } else return reject(new Error(`Writefile should return a string.`))

    })
}


export default ({
    read: readPromise,
    write: writePromise
}) as Files
