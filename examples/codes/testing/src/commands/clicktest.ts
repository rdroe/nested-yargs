
import { Module, isNode } from 'nyargs'
import { fakeCli } from 'nyargs/runtime'


export const clicktest: Module = {
    help: {
        description: 'click test',
        examples: { 'test': '' }
    },
    fn: async () => {
        if (!isNode()) {
            const ue = await import('@testing-library/user-event')
            const user = ue.default.setup()
            await fakeCli.handle('element --action create --tag textarea --class textarea-0')
            const ta = document.querySelector('.textarea-0')
            await user.click(ta)
            await user.keyboard('click test successful')
        }
        fakeCli.handle('match scalar -l 123 -r 123')
        return true
    }
}
