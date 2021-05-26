import { rest } from 'msw'

export const logUiErrorIntercept =     //auto login check rejected.
rest.post("/logUiError", (req, res, ctx) =>{
    console.warn('UI ERRRO: ', req.body.widget, req.body.errorMessage)
    return res(
        ctx.status(200),
        ctx.json(true)
    )
})
