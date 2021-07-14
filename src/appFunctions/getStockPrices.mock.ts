import { rest } from 'msw'

const resObj = {
    "c": 261.74,
    "h": 263.31,
    "l": 260.68,
    "o": 261.07,
    "pc": 259.45,
    "t": 1582641000
}

export const mockFinnHubDataQuote =
    rest.get("https://finnhub.io/api/v1/quote*", (req, res, ctx) => {
        // console.log('return mocked finnhub data /quote')
        return res(
            ctx.status(200),
            ctx.json(resObj)
        )
    })