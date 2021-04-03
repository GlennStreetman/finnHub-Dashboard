import types, { EndPointObj, StockObj } from '../../../types'

interface filters {
    description: string,
    endDate: number,
    startDate: number,
}

export default function companyNewsEndPoint(stockList: StockObj[], filters: filters, apiKey: string) {
    //filters used after data is returned.
    const queryStringObj: EndPointObj = {}

    for (const stock in stockList) {
        const f = filters
        const now = Date.now()
        const startUnixOffset = f.startDate !== undefined ? f.startDate : 604800 * 1000
        const startUnix = now - startUnixOffset
        const endUnixOffset = f.startDate !== undefined ? f.endDate : 0
        const endUnix = now - endUnixOffset
        const startDate = new Date(startUnix).toISOString().slice(0, 10);
        const endDate = new Date(endUnix).toISOString().slice(0, 10);
        const stockSymbol = stockList[stock].symbol
        const key = stockList[stock].key
        const queryString = `https://finnhub.io/api/v1/company-news?symbol=${stockSymbol}&from=${startDate}&to=${endDate}&token=${apiKey}`

        if (types.reStock.test(stockSymbol) === true && types.finnHubAPI.test(queryString) === true) {
            queryStringObj[key] = (queryString)
        } else {
            console.log("Failed company news endpoint Typeguard: ", queryString)
        }
    }
    return queryStringObj
}