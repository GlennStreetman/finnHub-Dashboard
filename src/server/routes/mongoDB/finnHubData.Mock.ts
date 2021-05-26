import { rest } from 'msw'

export const getFinnDashData_noData =     //auto login check rejected.
    rest.get("/finnDashData", (req, res, ctx) => {
        console.log('get finnDashData no data returned')
        const resList: any[] = []
        console.log('/finnDashDataReturning blank data')
        return res(
            ctx.status(200),
            ctx.json({ resList })
        )
    })

export const postFinnDashData_noSave =     //auto login check rejected.
    rest.post("/finnDashData", (req, res, ctx) => {
        console.log('post finnDashData no data saved')
        return res(
            ctx.status(200),
            ctx.json({ message: `Updates Complete` })
        )
    })