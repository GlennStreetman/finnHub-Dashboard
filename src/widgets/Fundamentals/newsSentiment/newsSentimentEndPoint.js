export default function companySentimentEndPoint(stockList, filters, apiKey){
    //filters used after data is returned.
    let queryStringObj = {}

    for (const stock in stockList) {
        
        const stockSymbole = stockList[stock].symbol
        const queryString = `https://finnhub.io/api/v1/news-sentiment?symbol=${stockSymbole}&token=${apiKey}`
        queryStringObj[stockSymbole] = (queryString)
    }
        return queryStringObj
}