import { get } from "../../shared/api/call"
import { Files } from '../../shared/utils/types'

const writePromise = async (fname: string, dat: string) => {
    var dataStr = `data:text/json;charset=utf-8,${dat.replace('\n', '\r\n')}`
    const dlAnchorElem = document.createElement('a')
    document.body.appendChild(dlAnchorElem)
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", fname);
    dlAnchorElem.click();
    dlAnchorElem.remove();
}

const readPromise = async (fullPath: string): Promise<string> => {
    return get(fullPath, {}, {})
        .then(async (response: Response) => {
            return response.text()
        })
}

const files: Files = {
    read: (path: string, opts?: any) => {
        if (opts) {
            console.warn('Warning; node options are ignored in the browser environment')
        }
        if (path.startsWith('input:')) {
            const domSelector = path.replace('input:', '')
            const elem = document.querySelector(domSelector)
            if (elem && (elem as HTMLTextAreaElement).value) {
                return Promise.resolve((elem as HTMLTextAreaElement).value)
            } else {
                throw new Error(`Selector ${path} triggered dom search to read, but element was empty or not fouund`)
            }
        }
        return readPromise(path)
    },
    write: (path: string, data: string, opts: unknown) => {
        if (opts) {
            console.warn('Warning; node options are ignored in the browser environment')
        }
        return writePromise(path, data)
    },
    mkdir: async (arg1: string, arg2?: string, arg3?: { recursive: boolean }) => 'Not making directory in browser environment'
}

export default files;

(window as any).nyargs = { files }
