import { platformIsNode } from 'nyargs'
import { getFs } from 'nyargs/runtime'

declare global {
    interface Window {
        pl: any
    }
}

type Session = any
type Atom = any
type ObjectOrFailure = object | 'fail'
interface Answer {
    prolog: string
    json: ObjectOrFailure
}

export type Answers = Answer[]
export type AnswersWithTerms = { results: Answers, queryTerms: string[] }



export const sessions: any[] = []


const hackScript = (script: string): Promise<any> => {
    return new Promise<void>((res) => {
        const scriptTag = document.createElement('script');
        scriptTag.setAttribute('src', script);
        scriptTag.onload = () => {
            return res()
        }
        document.head.appendChild(scriptTag);
    })
}

export const getPl = async (): Promise<any> => {
    if (platformIsNode) {
        return null
    }

    if (window.pl) return window.pl

    await hackScript('https://unpkg.com/tau-prolog@0.3.4/modules/core.js')
    await hackScript('https://unpkg.com/tau-prolog@0.3.4/modules/lists.js')

    return window.pl

}


export const consultAll = async (session: Session, files: string[]) => {
    const fs = await getFs()
    await Promise.all(files.map(async (f) => {
        const prolog = await fs.readFile(`pl/${f}.pl`, 'utf8')
        try {
            await session.consult(prolog);

        } catch (e) {
            console.error('Error consulting file ' + f)
            console.error(e)
        }
    }))
}

const addSession = async () => {
    const session = await (await getPl() as any).create(10000000) as Session;
    sessions.push(session);
    return new Promise<void>((res) => {
        session.consult(`
:- use_module(library(lists)).
mbr(X, List) :- member(X, List).
`, {
            success: () => {

                return res()
            }
        })
    })

}

export const latestSession: Session = () => {
    return sessions[sessions.length - 1]
}

function answers(session: any, container: Answer[], resolve: Function, reject: Function) {

    // Answers
    return session.answer({
        success: (answer: any) => {

            const formatted = session.format_answer(answer)
            if (answer) {
                if (typeof answer === 'object') {
                    container.push({
                        prolog: formatted,
                        json: answer
                    })
                } else {
                    container.push({
                        prolog: formatted,
                        json: [answer]
                    })
                }
                return answers(session, container, resolve, reject)
            } else {
                return resolve(container)
            }

        },
        error: function(err: any) {
            console.log('err', JSON.stringify(err, null, 2))
            // Uncaught error
            return reject(err)
        },
        fail: function() {
            // Fail 
            container.push({
                prolog: 'fail',
                json: 'fail'
            })
            return resolve(container)
        },
        limit: function() {
            console.log('limit exceeded')
            return reject('limit exceeded')

            // Limit exceeded 
        },
    });
}
const session = async (): Promise<{ query: Function }> => {
    if (sessions[sessions.length - 1]) { return sessions[sessions.length - 1] }
    await addSession()

    return sessions[sessions.length - 1]
}

export const query = async (prolog: string): Promise<AnswersWithTerms> => {

    const answerContainer: Answer[] = []
    const sess = await session()
    return new Promise(async (resolve, reject) => {

        sess.query(prolog, {
            success: (goal: Atom) => {
                console.log('in callback for query; goal', goal)
                let queryTerms: string[]
                if (typeof goal.id === 'string') {
                    queryTerms = [goal.id]
                } else {
                    queryTerms = goal.args.map(({ id }: { id: string }) => id).filter((id: string) => !!id)
                }
                return answers(sess, answerContainer, (arg: any) => {
                    return resolve({ results: arg, queryTerms })
                }, reject)
            },
            error: function(err: any) {
                console.log('goal-parsing error', err)
                // Error parsing goal
                return err
            },
        });


    })
}

