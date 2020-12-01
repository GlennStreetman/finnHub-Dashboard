
function GetStockPrice(context, stockDescription, apiKey, throttle) {
    console.log("getting stock prices for: ", stockDescription)
    const stockSymbol = stockDescription.indexOf(":") > 0 ? stockDescription.slice(0, stockDescription.indexOf(":")) : stockDescription;
    let stockPriceData = {};
    let that = context
    if (apiKey !== '') {
        throttle.enqueue(function() {
        fetch("https://finnhub.io/api/v1/quote?symbol=" + stockSymbol.slice(stockSymbol.indexOf('-') + 1, stockSymbol.length) + "&token=" + that.props.apiKey)
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

function LoadSocketData(context, p, getStockPrice){
  if (p.refreshStockData === 1) {
    p.toggleRefreshStockData();
    for (const stock in p.globalStockList) {
      getStockPrice(context, p.globalStockList[stock], p.apiKey, p.throttle)
    }
  }
}

export {GetStockPrice, LoadSocketData}