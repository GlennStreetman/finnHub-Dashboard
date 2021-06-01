import types, { EndPointObj, StockObj } from '../../../types'

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

export default function companyNewsEndPoint(stockList: StockObj[], filters: filters, apiKey: string) {
    //filters used after data is returned.
    const queryStringObj: EndPointObj = {}

    for (const stock in stockList) {
        const stockSymbol = stockList[stock].symbol
        const key = stockList[stock].key
        const queryString = `https://finnhub.io/api/v1/company-news?symbol=${stockSymbol}&from=${findDate(filters.startDate)}&to=${findDate(filters.endDate)}&token=${apiKey}`
        // console.log(queryString)
        if (types.reStock.test(stockSymbol) === true && types.finnHubAPI.test(queryString) === true) {
            queryStringObj[key] = (queryString)
        } else {
            console.log("Failed company news endpoint Typeguard: ", queryString)
        }
    }
    return queryStringObj
}