module.exports = function candleWidgetEndPoint(stockList, filters, apiKey){
    //filters should be start, end, resolution
    const endDate = filters.endDate
    const startDate = filters.startDate
    const resolution = filters.resolution
    let queryStringList = []
  
    for (const stock in stockList) {
      let stockSymbole = stock.slice(stock.indexOf('-')+1 , stock.length)
      const queryString = "https://finnhub.io/api/v1/stock/candle?symbol=" +
        stockSymbole +
        "&resolution=" +
        resolution +
        "&from=" +
        startDate +
        "&to=" +
        endDate +
        "&token=" + apiKey
  
        queryStringList.push(queryString)
      }
      return queryStringList
  }