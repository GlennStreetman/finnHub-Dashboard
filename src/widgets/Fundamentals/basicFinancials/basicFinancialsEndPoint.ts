import types, { EndPointObj, StockObj } from './../../../types'

export default function basicFinancialsEndPoint(stockList: StockObj[], filters, apiKey: string) {
    //filters used after data is returned.
    let queryStringObj: EndPointObj = {}

    for (const stock in stockList) {
        const stockSymbol = stockList[stock].symbol
        const key = stockList[stock].key
        const queryString = `https://finnhub.io/api/v1/stock/metric?symbol=${stockSymbol}&metric=all&token=${apiKey}`
        // console.log(queryString)
        if (types.reStock.test(stockSymbol) === true && types.finnHubAPI.test(queryString) === true) {
            queryStringObj[key] = (queryString)
        } else {
            console.log("Failed basic financials endpoint Typeguard: ", queryString)
        }
    }
    return queryStringObj
}