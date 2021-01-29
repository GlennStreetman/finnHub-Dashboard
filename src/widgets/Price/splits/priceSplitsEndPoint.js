function findDate(offset){
  const returnDate = new Date(Date.now() + offset).toISOString().slice(0, 10) 
  return returnDate
}

module.exports = function quoteWidgetEndPoint(stockList, filters, apiKey){
    //filters should be empty
    let queryStringObj = {}
    for (const stock in stockList) {
      const stockSymbole = stockList[stock].symbol
      
      const queryString = `https://finnhub.io/api/v1/stock/split?symbol=${stockSymbole}&from=${findDate(filters.startDate)}&to=${findDate(filters.endDate)}&token=${apiKey}`
  
        queryStringObj[stockSymbole] = (queryString)
      }
      return queryStringObj
  }