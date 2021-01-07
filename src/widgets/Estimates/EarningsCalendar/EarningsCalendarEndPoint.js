function findDate(offset){
    const returnDate = new Date(Date.now() + offset).toISOString().slice(0, 10) 
    return returnDate
  }


module.exports = function EPSSuprisesEndPoint(stockList, filters, apiKey){

    let queryStringObj = {}

    for (const stock in stockList) {
        let stockSymbole = stockList[stock].slice(stockList[stock].indexOf('-')+1 , stockList[stock].length)
        const queryString = `https://finnhub.io/api/v1/calendar/earnings?from=${findDate(filters.startDate)}1&to=${findDate(filters.endDate)}1&symbol=${stockSymbole}&token=${apiKey}`
        queryStringObj[stockSymbole] = (queryString)
    }
        return queryStringObj
}