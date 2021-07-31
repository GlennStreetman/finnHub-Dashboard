import types, { EndPointObj, StockObj } from '../../../types'

export default function financialsAsReportedEndPoint(stockList: StockObj[], filters, apiKey: string) {
    //filters used after data is returned.
    const queryStringObj: EndPointObj = {}

    for (const stock in stockList) {
        const stockSymbol = stockList[stock].symbol
        const key = stockList[stock].key
        const frequency = filters.frequency ? filters.frequency : 'annual'
        const queryString = `https://finnhub.io/api/v1/stock/financials-reported?symbol=${stockSymbol}&token=${apiKey}&freq=${frequency}`
        if (types.reStock.test(stockSymbol) === true && types.finnHubAPI.test(queryString) === true) {
            queryStringObj[key] = (queryString)
        } else {
            console.log("Failed financials as reported endpoint Typeguard: ", queryString)
        }
    }
    return queryStringObj
}