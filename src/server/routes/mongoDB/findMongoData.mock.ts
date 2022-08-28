import { rest } from 'msw'

export const findMongoData_empty =
    rest.post("/api/findMongoData", (req, res, ctx) => {
        const emptyResponse = []
        return res(
            ctx.status(200),
            ctx.json({ emptyResponse })
        )
    })