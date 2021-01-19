module.exports = function companyNewsEndPoint(stockList, filters, apiKey){
    //filters used after data is returned.
    let queryStringObj = {}

    for (const stock in stockList) {
        
        const f = filters
        const now = Date.now()
        const startUnixOffset = f.startDate !== undefined ? f.startDate : 604800*1000
        const startUnix = now - startUnixOffset
        const endUnixOffset = f.startDate !== undefined ? f.endDate : 0
        const endUnix = now - endUnixOffset
        const startDate = new Date(startUnix).toISOString().slice(0, 10);
        const endDate = new Date(endUnix).toISOString().slice(0, 10);

        
        const stockSymbole = stockList[stock].symbol
        const queryString = `https://finnhub.io/api/v1/company-news?symbol=${stockSymbole}&from=${startDate}&to=${endDate}&token=${apiKey}`
        console.log(queryString)
        queryStringObj[stockSymbole] = (queryString)
    }
        return queryStringObj
}