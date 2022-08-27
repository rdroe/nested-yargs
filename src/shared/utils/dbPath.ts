/*
  Return 
  1 - the full pathname; combined filenames and subdirs.
  2 - the subdir path only, sans filename
*/
export const dbPath = (path: string, filename: string): { fullpath: string, subdirs: string[] } => {         // move over to export, not import
    const split = filename.includes('/')
        ? filename.split('/').filter(section => !!section) : [filename]
    const fname = split.pop()
    split.unshift(path as string)
    const subdirs = [...split]
    const fullpath = [...subdirs, fname].join('/')
    console.log('dirs and file', subdirs, 'full:', fullpath)
    return { fullpath, subdirs }
}

export const filterObject = (obj: object, fn:
    (v: any, k: string) => boolean
): any => {

    return Object.entries(obj).reduce((accum, [key, val]) => {
        if (fn(val, key) === true) return { ...accum, [key]: val }
        return accum
    }, {})

}
