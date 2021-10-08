import { rest } from 'msw'

export const findMongoData_empty =
    rest.post("/findMongoData", (req, res, ctx) => {
        const emptyResponse = []
        return res(
            ctx.status(200),
            ctx.json({ emptyResponse })
        )
    })