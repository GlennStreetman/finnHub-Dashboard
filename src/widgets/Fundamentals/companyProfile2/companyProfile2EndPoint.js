module.exports = function basicFinancialsEndPoint(stockList, filters, apiKey){
    //filters used after data is returned.
    let queryStringObj = {}

    for (const stock in stockList) {
        const stockSymbole = stockList[stock].symbol
        const queryString = `https://finnhub.io/api/v1/stock/profile2?symbol=${stockSymbole}&token=${apiKey}`
        queryStringObj[stockSymbole] = (queryString)
    }
        return queryStringObj
}