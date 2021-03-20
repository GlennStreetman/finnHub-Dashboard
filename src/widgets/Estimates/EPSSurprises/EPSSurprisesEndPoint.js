
export default function EPSSuprisesEndPoint(stockList, filters, apiKey){

    let queryStringObj = {}

    for (const stock in stockList) {
        let stockSymbole = stockList[stock].symbol
        const queryString = `https://finnhub.io/api/v1/stock/earnings?symbol=${stockSymbole}&token=${apiKey}`
        queryStringObj[stockSymbole] = (queryString)
    }
        return queryStringObj
}
  