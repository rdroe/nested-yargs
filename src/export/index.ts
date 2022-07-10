import * as commands_ from '../commands'
import { isNode } from '../lib/dynamic'
import * as store_ from '../lib/store'
import * as hook1_ from '../../dist-server/src/hooks'
import * as hook2_ from '../../dist-browser/src/hooks'
import * as idbBackupAndRestore_ from '../lib/idb-backup-and-restore'
import * as call_ from '../lib/api/call'
import * as setUp_ from '../setUp'
import * as loop_ from '../loop'
import * as dynamic_ from '../lib/dynamic'
import { Dexie as Dexie_ } from 'dexie'

type ExportFn<T> = Promise<T>

export let commands: ExportFn<typeof commands_>
export let store: ExportFn<typeof store_>
export let setUp: ExportFn<typeof setUp_>
type HooksProm = ExportFn<typeof hook1_> | ExportFn<typeof hook2_>
export let idbBackupAndRestore: ExportFn<typeof idbBackupAndRestore_>
export let call: ExportFn<typeof call_>
export let loop: ExportFn<typeof loop_>
export let dynamic: ExportFn<typeof dynamic_>
export let Dexie: ExportFn<typeof Dexie_>
export type Dexie = typeof Dexie_

if (isNode()) {
    commands = import('../../dist-server/src/commands')
} else {
    commands = import('../../dist-browser/src/commands')
}

if (isNode()) {
    store = import('../../dist-server/src/lib/store')
} else {
    store = import('../../dist-browser/src/lib/store')
}

if (isNode()) {
    setUp = import('../../dist-server/src/setUp')
} else {
    setUp = import('../../dist-browser/src/setUp')
}

let hooks_: HooksProm

if (isNode()) {
    hooks_ = import('../../dist-server/src/hooks')
} else {
    hooks_ = import('../../dist-browser/src/hooks')
}

export const hooks = hooks_

if (isNode()) {
    idbBackupAndRestore = import('../../dist-server/src/lib/idb-backup-and-restore')
} else {
    idbBackupAndRestore = import('../../dist-browser/src/lib/idb-backup-and-restore')
}


if (isNode()) {
    call = import('../../dist-server/src/lib/api/call')
} else {
    call = import('../../dist-browser/src/lib/api/call')
}

if (isNode()) {
    loop = import('../../dist-server/src/loop')
} else {
    loop = import('../../dist-browser/src/loop')
}


if (isNode()) {
    dynamic = import('../../dist-server/src/lib/dynamic')
} else {
    dynamic = import('../../dist-browser/src/lib/dynamic')
}


if (isNode()) {
    // @ts-ignore
    import('fake-indexeddb/auto').then(() => {
        import('dexie').then(({ Dexie: DexieImport }) => {
            Dexie = Promise.resolve(DexieImport)
        })
    })
} else {
    import('dexie').then(({ Dexie: DexieImport }) => {
        Dexie = Promise.resolve(DexieImport)
    })
}
