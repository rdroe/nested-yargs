import { platformIsNode, createApp, Modules } from 'nyargs'
import { clicktest } from './commands/clicktest'

const creator = () => createApp(
    { clicktest },
    {
        programs: {
            matchTwos: [
                'match scalar -l 22 2 202 -r 22 2022, 202'
            ]
        },
        config: {
            useFakeDb: true,
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
    'testing lib > '
)

export default creator
export const app = creator

if (platformIsNode) {
    creator()
}
