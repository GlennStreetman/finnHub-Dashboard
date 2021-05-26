import { rest } from 'msw'

const resObj = [
    {
        "currency": "USD",
        "description": "UAN POWER CORP",
        "displaySymbol": "UPOW",
        "figi": "BBG000BGHYF2",
        "mic": "OTCM",
        "symbol": "UPOW",
        "type": "Common Stock"
    },
    {
        "currency": "USD",
        "description": "APPLE INC",
        "displaySymbol": "AAPL",
        "figi": "BBG000B9Y5X2",
        "mic": "XNGS",
        "symbol": "AAPL",
        "type": "Common Stock"
    },
    {
        "currency": "USD",
        "description": "EXCO TECHNOLOGIES LTD",
        "displaySymbol": "EXCOF",
        "figi": "BBG000JHDDS8",
        "mic": "OOTC",
        "symbol": "EXCOF",
        "type": "Common Stock"
    }
]

export const mockFinnhubDataStockSymbol =
    rest.get("https://finnhub.io/api/v1/stock/symbol*", (req, res, ctx) => {
        console.log('return mocked finnhub data /symbol')
        return res(
            ctx.status(200),
            ctx.json(resObj)
        )
    })