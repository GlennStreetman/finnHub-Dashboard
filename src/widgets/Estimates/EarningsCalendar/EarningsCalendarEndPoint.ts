import types, { EndPointObj, StockObj } from './../../../types'

interface filters {
    description: string,
    endDate: number,
    startDate: number,
}

function findDate(offset) {
    const returnDate = new Date(Date.now() + offset).toISOString().slice(0, 10)
    // console.log('returnDate', returnDate)
    return returnDate
}

export default function earningsCalendarEndPoint(stockList: StockObj[], filters: filters, apiKey: string) {
    // console.log(stockList, filters, apiKey)
    let queryStringObj: EndPointObj = {}
    // console.log('BUILDING NEW API KEYS', filters)
    for (const stock in stockList) {
        const stockSymbol = stockList[stock].symbol
        const key = stockList[stock].key
        const queryString = `https://finnhub.io/api/v1/calendar/earnings?from=${findDate(filters.startDate)}&to=${findDate(filters.endDate)}&symbol=${stockSymbol}&token=${apiKey}`
        // queryStringObj[stockKey] = (queryString)
        if (types.reStock.test(stockSymbol) === true && types.finnHubAPI.test(queryString) === true) {
            queryStringObj[key] = (queryString)
        } else {
            console.log("Failed earnings calendar endpoint Typeguard: ", queryString)
        }
    }
    // console.log(queryStringObj)
    return queryStringObj
}