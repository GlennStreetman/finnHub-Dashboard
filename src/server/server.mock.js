import { rest } from 'msw'

export const getNoMock =     //auto login check rejected.
    rest.get("/*", (req, res, ctx) => {
        console.log('/* ---No Mock---', req)
        return res(
            ctx.status(200),
            ctx.json({})
        )
    })