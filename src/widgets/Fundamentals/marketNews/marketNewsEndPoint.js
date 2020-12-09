module.exports = function marketNewsEndPoint(stockList, filters, apiKey){
    //filters used after data is returned.
    let queryStringObj = {}

    for (const stock in stockList) {
        const f = filters
        let stockSymbole = stockList[stock].slice(stockList[stock].indexOf('-')+1 , stockList[stock].length)
        const queryString = `https://finnhub.io/api/v1/company-news?symbol=${stockSymbole}&from=${f.startDate}&to=${f.endDate}&token=${apiKey}`
        console.log(queryString)
        queryStringObj[stockSymbole] = (queryString)
    }
        return queryStringObj
}