import types, { EndPointObj, StockObj } from './../../../types'

interface filters {
    description: string,
    endDate: number,
    startDate: number,
}

function findDate(offset) {
    // console.log('offset', offset)
    const returnDate = new Date(Date.now() + offset).toISOString().slice(0, 10)
    return returnDate
}

export default function priceSplitEndPoint(stockList: StockObj[], filters: filters, apiKey: string) {
    let queryStringObj: EndPointObj = {}
    for (const stock in stockList) {
        if (stockList[stock].symbol !== undefined) {
            const stockSymbol = stockList[stock].symbol
            const key = stockList[stock].key
            const queryString = `https://finnhub.io/api/v1/stock/split?symbol=${stockSymbol}&from=${findDate(filters.startDate)}&to=${findDate(filters.endDate)}&token=${apiKey}`
            if (types.reStock.test(stockSymbol) === true && types.finnHubAPI.test(queryString) === true) {
                queryStringObj[key] = (queryString)
            } else {
                console.log("Failed pricesplit endpoint Typeguard: ", queryString)
            }
        }
    }
    return queryStringObj
}