import types, { EndPointObj, StockObj } from '../../../types'

export default function peersEndPoint(stockList: StockObj[], filters, apiKey: string) {

    const queryStringObj: EndPointObj = {}

    for (const stock in stockList) {
        const stockSymbol = stockList[stock].symbol
        const key = stockList[stock].key
        const queryString = `https://finnhub.io/api/v1/stock/peers?symbol=${stockSymbol}&token=${apiKey}`
        if (types.reStock.test(stockSymbol) === true && types.finnHubAPI.test(queryString) === true) {
            queryStringObj[key] = (queryString)
        } else {
            console.log("Failed news Sentiment endpoint Typeguard: ", queryString)
        }
    }
    return queryStringObj
}