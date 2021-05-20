import { rest } from 'msw'

export const getRegister_success =     //auto login check rejected.
rest.post("/register", (req, res, ctx) =>{
    return res(
        ctx.status(200),
        ctx.json({message: 'new user created'})
    )
})