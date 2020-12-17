module.exports = function candleWidgetEndPoint(stockList, filters, apiKey){
    //filters should be: start, end, resolution
    const now = Date.now()
    const startUnixOffset = filters.startDate !== undefined ? filters.startDate : 604800
    const startUnix = Math.floor((now - startUnixOffset) / 1000)
    const endUnixOffset = filters.startDate !== undefined ? filters.endDate : 0
    const endUnix = Math.floor((now - endUnixOffset) / 1000)

    const resolution = filters.resolution
    let queryStringObj = {}
  
    for (const stock in stockList) {
      let stockSymbole = stockList[stock].slice(stockList[stock].indexOf('-')+1 , stockList[stock].length)
      const queryString = "https://finnhub.io/api/v1/stock/candle?symbol=" +
        stockSymbole +
        "&resolution=" +
        resolution +
        "&from=" +
        startUnix +
        "&to=" +
        endUnix +
        "&token=" + apiKey
  
        queryStringObj[stockSymbole] = (queryString)
      }
      return queryStringObj
  }