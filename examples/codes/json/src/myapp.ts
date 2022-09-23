import { platformIsNode, createApp } from 'nyargs'

const creator = () => createApp(
    async function nyargsApp({
        cache,
        program,
        test,
        match,
        repl,
        setDictionary,
        nest,
        element,
        configure,
    }, yargs: any) {

        // dynamicall import your own modules here, e.g.
        // const myModule = (await import('./myModule')).default

        setDictionary({
            myprogram: [
                'match scalar -l 1 2 3 -r 1 2 3',
                'match scalar -l comparable -r comparable'
            ]
        })

        await configure('useFakeDb', false)

        return repl({
            cache,
            test,
            match,
            nest,
            element,
            // myModule,
            // aliases
            pr: program,
            pro: program,
            prog: program,

        }, yargs, 'app > ')

    })


export default creator
export const app = creator
// If the platform is node, no need to run a server.
// Run the cli right now.
if (platformIsNode) {
    creator()
}
