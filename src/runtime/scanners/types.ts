import { Module, ReadlineInterface } from '../../shared/utils/types'



export type ScannerCliIds = number[] | number | '*'
export type ScannerGuard = string | Module[]
export type Scanner = {
    allow?: ScannerGuard
    cliIds: ScannerCliIds
    fn?: WrappedUserFn<boolean> | {
        fn: WrappedUserFn<boolean>
        a: WrappedUserFn<void>
        b: WrappedUserFn<boolean>
    }
    throttle?: number
    preprocess?: (str: string | null) => string | null
    init?: () => Promise<void>
}

export type WrappedUserFn<Ret = boolean> = (key: KeyboardEvent, curReadline: ReadlineInterface, taId: string, scanner: Scanner) => Promise<Ret>

export type WrappedUserListenerFns = {
    fn: WrappedUserFn<boolean>,
    b: WrappedUserFn<boolean>,
    a: WrappedUserFn<void>
}

