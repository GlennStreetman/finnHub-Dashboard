module.exports = function quoteWidgetEndPoint(stockList, filters, apiKey){
    //filters should be empty
    let queryStringObj = {}
    delete stockList.sKeys
    for (const stock in stockList) {
      const stockSymbole = stockList[stock].symbol
      const key = stockList[stock].key
      const queryString = "https://finnhub.io/api/v1/quote?symbol=" + 
      stockSymbole.slice(stockSymbole.indexOf('-') + 1, stockSymbole.length) + 
      "&token=" +apiKey
  
        queryStringObj[key] = (queryString)
      }
      return queryStringObj
  }