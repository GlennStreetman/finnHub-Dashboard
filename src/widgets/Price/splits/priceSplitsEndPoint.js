function findDate(offset){
    // console.log('offset', offset)
    const returnDate = new Date(Date.now() + offset).toISOString().slice(0, 10) 
    return returnDate
}

module.exports = function priceSplitEndPoint(stockList, filters, apiKey){
    let queryStringObj = {}
    for (const stock in stockList) {
        if (stockList[stock].symbol !== undefined){
            const stockSymbole = stockList[stock].symbol
            const stockKey = stockList[stock].key
            const queryString = `https://finnhub.io/api/v1/stock/split?symbol=${stockSymbole}&from=${findDate(filters.startDate)}&to=${findDate(filters.endDate)}&token=${apiKey}`
            queryStringObj[stockKey] = (queryString)
        }
    }
    return queryStringObj
}