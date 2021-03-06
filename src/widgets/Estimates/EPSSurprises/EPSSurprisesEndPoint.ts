import types, { EndPointObj, StockObj } from './../../../types'

export default function EPSSuprisesEndPoint(stockList: StockObj[], filters, apiKey: string) {

    let queryStringObj: EndPointObj = {}

    for (const stock in stockList) {
        let stockSymbol = stockList[stock].symbol
        const key = stockList[stock].key
        const queryString = `https://finnhub.io/api/v1/stock/earnings?symbol=${stockSymbol}&token=${apiKey}`
        if (types.reStock.test(stockSymbol) === true && types.finnHubAPI.test(queryString) === true) {
            queryStringObj[key] = (queryString)
        } else {
            console.log("Failed EPS Suprises endpoint Typeguard: ", queryString)
        }
    }
    return queryStringObj
}