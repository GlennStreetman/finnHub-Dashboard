import { rest } from 'msw'

export const getLogin_succeed =     //login attempt success
rest.get("/login", (req, res, ctx) =>{
    console.log('get/login: Returning login info. ')
    return res(
        ctx.status(200),
        ctx.json({
            key: 0,
            login: 1,
            ratelimit: 25,
            apiAlias: 'alias',
            widgetsetup: '{"PriceSplits":false}',
            exchangelist: ['US'],
            defaultexchange: ['US',]
        })
    )
})