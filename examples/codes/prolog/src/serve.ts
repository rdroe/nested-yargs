import express from 'express'
import cors from 'cors'
// @ts-ignore 
import swipl from 'swipl'


const app = express()
app.use(express.urlencoded({ extended: true }));

const callSwipl = (queryStr: string) => {
    const query = new swipl.Query(queryStr);
    return new Promise((resolve /*, reject */) => {
        console.log('opened query:', queryStr)
        let ret = null;
        const data: any[] = []
        while (ret = query.next()) {
            data.push(ret)
        }
        query.close()
        console.log('closed query', queryStr)
        console.log(`result sample: ${JSON.stringify(data, null, 2).split('\n').slice(0, 8).join('\n')}`);
        return resolve(data)
    }).catch((e) => {

        console.error(e.message)
        console.error(e.stack)

        setTimeout(() => {
            try {
                query.close()
            } catch (e) {
                console.log('tried closing query; failed (as it may have already been closed')

            }

        }, 500)
        return [{ msg: e.message, stack: e.stack }]
    })
}


app.use(express.json());
app.use(cors())
app.all(
    '/',
    async function(request, response) {
        if (!request.body || !request.body.data) {
            return response.json({ msg: 'posted body data is missing', data: [] })
        }

        const body1 = request.body.data
        if (!body1.query) {
            return response.json({ msg: 'query is required; but it is missing', data: body1 })
        }

        return response.json({
            msg: body1.query,
            data: await callSwipl(body1.query)
        })
    });

app.listen(8081, () => {
    console.log('swipl server started')
})
