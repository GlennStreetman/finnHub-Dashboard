import { rest } from 'msw'

export const getCheckLogin_fail =     //auto login check rejected.
rest.get("/checkLogin", (req, res, ctx) =>{
    console.log('get/CheckLogin Fail, returning login 0')
    return res(
        ctx.status(200),
        ctx.json({login: 0})
    )
})



export const getCheckLogin_success =     //auto login check rejected.
rest.get("/checkLogin", (req, res, ctx) =>{
    // console.log('get/CheckLogin success, returning login 1')
    return res(
        ctx.status(200),
        ctx.json({
            apiKey: 'sandboxTestApiKey', //always include sandbox so that socket server doesnt setup.
            login: 1,
            ratelimit: 25,
            apiAlias: 'alias',
            widgetsetup: '{"PriceSplits":false}',
            exchangelist: ['US'],
            defaultexchange: ['US',]
        })
    )
})

