import { rest } from 'msw'

export const updateGLConfig_success =     //auto login check rejected.
    rest.post("/api/updateGQLConfig", (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({ message: `Update filters Complete` })
        )
    })