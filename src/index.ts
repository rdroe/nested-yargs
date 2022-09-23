export * from "./shared/utils/types"
import isNode_ from './shared/utils/isNode'
import createAppFn from './shared/utils/createApp'
export const isNode = isNode_
export const platformIsNode = isNode()
export const createApp = createAppFn
