function findDate(offset){
    const returnDate = new Date(Date.now() + offset).toISOString().slice(0, 10) 
    return returnDate
  }


export default function earningsCalendarEndPoint(stockList, filters, apiKey){
    // console.log(stockList, filters, apiKey)
    let queryStringObj = {}

    for (const stock in stockList) {
        const stockSymbol = stockList[stock].symbol
        const stockKey = stockList[stock].key
        const queryString = `https://finnhub.io/api/v1/calendar/earnings?from=${findDate(filters.startDate)}1&to=${findDate(filters.endDate)}1&symbol=${stockSymbol}&token=${apiKey}`
        queryStringObj[stockKey] = (queryString)
    }
    // console.log(queryStringObj)
        return queryStringObj
}