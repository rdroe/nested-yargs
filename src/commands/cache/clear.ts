import { clearCacheDb } from "../../runtime/store";

export default {
    help: {
        description: 'totally delete a cached db',
        examples: { '': 'totally clear "cache" db entries' },
    },
    fn: () => {
        return clearCacheDb()
    }
}
