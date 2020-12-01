
function GetStockPrice(context, stockDescription, apiKey, throttle) {
  if (stockDescription !== undefined) {
    // console.log("------getStockPrice-------", stockDescription)
    // console.log("getting stock prices for: ", stockDescription)
    const stockSymbol = stockDescription.indexOf(":") > 0 ? stockDescription.slice(0, stockDescription.indexOf(":")) : stockDescription;
    let stockPriceData = {};
    let that = context
    if (apiKey !== '') {
        throttle.enqueue(function() {
        fetch("https://finnhub.io/api/v1/quote?symbol=" + stockSymbol.slice(stockSymbol.indexOf('-') + 1, stockSymbol.length) + "&token=" + apiKey)
          .then((response) => {
            if (response.status === 429) {
              throttle.setSuspend(4000)
              that.GetStockPrice(context, stockDescription, apiKey, throttle)
              throw new Error('finnhub 429')
            } else {
              // console.log(Date().slice(20,25) + 'getStockPrice ' + stockDescription)
              return response.json()
            }
          })
          .then((data) => {
            // console.log(data)
            //destructure data returned from fetch.
            const {
              c: a, //current price
              h: b, //current days high price
              l: c, //current days low price
              o: d, //current days open price
              pc: e, //previous days close price
            } = data;
            //create object from destructured data above.
            stockPriceData = {
              currentPrice: a, 
              dayHighPrice: b,
              dayLowPrice: c,
              dayOpenPrice: d,
              prevClosePrice: e,
            };

            that.setState((prevState) => {
              let newTrackedStockData = Object.assign({}, prevState.trackedStockData);
              newTrackedStockData[stockSymbol] = stockPriceData;
              return { trackedStockData: newTrackedStockData };
            });
          })
          .catch(error => {
            console.log(error.message)
          });
      })
    }
  }
}

function LoadStockData(context, s, getStockPrice){
  // console.log("------loadStockPrice-------")
  if (s.refreshStockData === 1 && s.globalStockList !== []) {
    // console.log(s.globalStockList)
    context.setState({ refreshStockData: 0 })
    for (const stock in s.globalStockList) {
      // console.log("stocks")
      // console.log("-->", stock, s.globalStockList)
      getStockPrice(context, s.globalStockList[stock], s.apiKey, s.throttle)
    }
  }
}

export {GetStockPrice, LoadStockData}