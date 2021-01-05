function sStock(stock){
    return stock.slice(stock.indexOf("-")+1, stock.length)
}

module.exports = function companySentimentEndPoint(stockList, filters, apiKey){
    //filters used after data is returned.
    let queryStringObj = {}

    for (const stock in stockList) {
        console.log(stockList[stock])
        let stockSymbole = sStock(stockList[stock])
        const queryString = `https://finnhub.io/api/v1/stock/financials-reported?symbol=${stockSymbole}&token=${apiKey}`
        queryStringObj[stockSymbole] = (queryString)
    }
    console.log("----------------------",queryStringObj)
    return queryStringObj
} 