import { AppArguments } from "../../appTypes";
import { clearCacheDb } from "../../lib/store";



export default {
    help: {
        description: 'totally delete a cached db',
        examples: { 'clear': 'totally clear "cache" db entries' },
    },
    fn: (_: AppArguments) => {
        return clearCacheDb()
    }
}
