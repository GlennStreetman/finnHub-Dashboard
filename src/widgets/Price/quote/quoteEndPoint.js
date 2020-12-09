module.exports = function quoteWidgetEndPoint(stockList, filters, apiKey){
    //filters should be empty
    let queryStringObj = {}
    for (const stock in stockList) {
      let stockSymbole = stockList[stock].slice(stockList[stock].indexOf('-')+1 , stockList[stock].length)
      const queryString = "https://finnhub.io/api/v1/quote?symbol=" + 
      stockSymbole.slice(stockSymbole.indexOf('-') + 1, stockSymbole.length) + 
      "&token=" +apiKey
  
        queryStringObj[stockSymbole] = (queryString)
      }
      return queryStringObj
  }