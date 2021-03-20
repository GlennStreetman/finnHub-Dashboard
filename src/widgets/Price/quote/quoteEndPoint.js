export default function quoteWidgetEndPoint(stockList, filters, apiKey){
    //filters should be empty
    // console.log('quoteEndPoint', stockList, apiKey)
    let queryStringObj = {}
    const thisList = {...stockList}
    for (const stock in thisList) {
      const stockSymbole = thisList[stock].symbol
      const key = thisList[stock].key
      const queryString = "https://finnhub.io/api/v1/quote?symbol=" + 
      stockSymbole.slice(stockSymbole.indexOf('-') + 1, stockSymbole.length) + 
      "&token=" +apiKey
  
        queryStringObj[key] = (queryString)
      }
      return queryStringObj
  }