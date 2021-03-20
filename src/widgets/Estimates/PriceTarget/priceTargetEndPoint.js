
export default function recommendationTrendsEndPoint(stockList, filters, apiKey){

    let queryStringObj = {}

    for (const stock in stockList) {
        const stockSymbole = stockList[stock].symbol
        const queryString = `https://finnhub.io/api/v1/stock/price-target?symbol=${stockSymbole}&token=${apiKey}`
        queryStringObj[stockSymbole] = (queryString)
    }
        return queryStringObj
}