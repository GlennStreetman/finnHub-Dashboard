import types, { EndPointObj, StockObj } from '../../../types'

export default function basicFinancialsEndPoint(stockList: StockObj[], filters, apiKey: string) {
    //filters used after data is returned.
    const queryStringObj: EndPointObj = {}

    for (const stock in stockList) {
        const stockSymbol = stockList[stock].symbol
        const key = stockList[stock].key
        const queryString = `https://finnhub.io/api/v1/stock/profile2?symbol=${stockSymbol}&token=${apiKey}`
        if (types.reStock.test(stockSymbol) === true && types.finnHubAPI.test(queryString) === true) {
            queryStringObj[key] = (queryString)
        } else {
            console.log("Failed company news endpoint Typeguard: ", queryString)
        }
    }
    return queryStringObj
}