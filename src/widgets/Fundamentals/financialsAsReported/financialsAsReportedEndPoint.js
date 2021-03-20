function sStock(stock){
    return stock.slice(stock.indexOf("-")+1, stock.length)
}

export default function financialsAsReportedEndPoint(stockList, filters, apiKey){
    //filters used after data is returned.
    let queryStringObj = {}

    for (const stock in stockList) {
        let stockSymbole = sStock(stockList[stock])
        const queryString = `https://finnhub.io/api/v1/stock/financials-reported?symbol=${stockSymbole}&token=${apiKey}`
        queryStringObj[stockSymbole] = (queryString)
    }
    return queryStringObj
} 