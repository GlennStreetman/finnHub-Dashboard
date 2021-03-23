import types, { EndPointObj, StockObj } from './../types'

interface filters { //add filter definition if used by widget.
    description: string,
    endDate: number,
    resolution: string,
    startDate: number,
}

//RENAME
//Rewrite function to create finnHub endpoint api strings.
//For widgets with a target stock return an object single apistring, if no target stock return apistring for each stock in widget.
export default function WIDGETNAMEEndPoint(stockList: StockObj[], filters: filters, apiKey: string) {
    //filters should be: start, end, resolution
    // console.log('NEW FILTERS!!!', Object.keys(filters))
    const now: number = Date.now()
    const startUnixOffset: number = filters.startDate !== undefined ? filters.startDate : 604800
    const startUnix: number = Math.floor((now - startUnixOffset) / 1000)
    const endUnixOffset: number = filters.startDate !== undefined ? filters.endDate : 0
    const endUnix: number = Math.floor((now - endUnixOffset) / 1000)
    const resolution: string = filters.resolution
    let queryStringObj: EndPointObj = {}

    for (const stock in stockList) {
        // console.log(theseFilters, Object.keys(theseFilters))
        const key = stockList[stock].key
        const stockSymbol = stockList[stock].symbol
        const queryString = "https://finnhub.io/api/v1/stock/candle?symbol=" +
            stockSymbol +
            "&resolution=" +
            resolution +
            "&from=" +
            startUnix +
            "&to=" +
            endUnix +
            "&token=" + apiKey

        if (types.reStock.test(stockSymbol) === true && types.finnHubAPI.test(queryString) === true) {
            queryStringObj[key] = (queryString)
        } else {
            console.log("Failed WIDGETNAME endpoint Typeguard: ", queryString)
        }
        // console.log("QUERYSTRING", queryString)
    }
    return queryStringObj
}