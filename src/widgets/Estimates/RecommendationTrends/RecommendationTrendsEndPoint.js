
module.exports = function recommendationTrendsEndPoint(stockList, filters, apiKey){

    let queryStringObj = {}

    for (const stock in stockList) {
        let stockSymbole = stockList[stock].slice(stockList[stock].indexOf('-')+1 , stockList[stock].length)
        const queryString = `https://finnhub.io/api/v1/stock/recommendation?symbol=${stockSymbole}&token=${apiKey}`
        queryStringObj[stockSymbole] = (queryString)
    }
        return queryStringObj
}