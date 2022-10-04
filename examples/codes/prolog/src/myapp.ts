import { platformIsNode, createApp, Modules } from 'nyargs'
import pl from './commands/pl'

const creator = () => createApp(
    { pl },
    {
        programs: {
            matchTwos: [
                'match scalar -l 22 2 202 -r 22 2022, 202'
            ]
        },
        config: {
            useFakeDb: false,
            // process all input
            wrapperFn: (cmd: string, modules: Modules) => {

                if (Object.keys(modules).find(nyCmd => cmd.trim().startsWith(nyCmd))) {
                    return cmd
                }

                if (cmd.includes('"')) {
                    console.error("error; a prolog query should not contain \" marks.")
                    return
                }
                return `pl "${cmd}"`
            }
        }
    },
    'prolog > '
)




export default creator
export const app = creator

// If the platform is node, no need to run a server.
// Run the cli right now.
if (platformIsNode) {
    creator()
}
