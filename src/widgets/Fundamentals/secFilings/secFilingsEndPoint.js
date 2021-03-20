function sStock(stock){
    return stock.slice(stock.indexOf("-")+1, stock.length)
}

export default function secFilingsEndPoint(stockList, filters, apiKey){
    //filters used after data is returned.
    let queryStringObj = {}

    for (const stock in stockList) {
        let stockSymbole = sStock(stockList[stock])
        const queryString = `https://finnhub.io/api/v1/stock/filings?symbol=${stockSymbole}&token=${apiKey}`
        queryStringObj[stockSymbole] = (queryString)
    }
    return queryStringObj
} 