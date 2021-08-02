
import setUp, { repl as repl_ } from './src/setUp'
import { get as apiGet, post as apiPost, SaveRequest as SR, QueryParams as QP } from './src/lib/api/call'
import { AppOptions as AO, Action as A, AppArgv as AA } from './src/appTypes'

import { object as qObj } from './src/queue'

export default setUp
export const repl = repl_
export type SaveRequest = SR
export type QueryParams = QP
export const post = apiPost
export const get = apiGet
export type AppOptions = AO
export type Action = A
export type AppArgv = AA
export const object = qObj
export const hook = qObj.resolver
