module.exports = function basicFinancialsEndPoint(stockList, filters, apiKey){

    let queryStringObj = {}

    for (const stock in stockList) {
        let stockSymbole = stockList[stock].slice(stockList[stock].indexOf('-')+1 , stockList[stock].length)
        const queryString = `https://finnhub.io/api/v1/stock/peers?symbol=${stockSymbole}&token=${apiKey}`
        queryStringObj[stockSymbole] = (queryString)
    }
        return queryStringObj
}