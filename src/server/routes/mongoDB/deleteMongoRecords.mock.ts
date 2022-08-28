import { rest } from 'msw'

export const deleteFinnDashData_success =
    rest.get("/api/deleteFinnDashData", (req, res, ctx) => {
        // console.log('Records deleted')
        return res(
            ctx.status(200),
            ctx.json({ message: 'Records deleted.' })
        )
    })