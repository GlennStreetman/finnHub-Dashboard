import { rest } from 'msw'

export const getCheckLogin_fail =     //auto login check rejected.
rest.get("/checkLogin", (req, res, ctx) =>{
    console.log('get/CheckLogin Fail, returning login 0')
    return res(
        ctx.status(200),
        ctx.json({login: 0})
    )
})