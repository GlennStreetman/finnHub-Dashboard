import {finnHub} from "./throttleQueue";

function GetStockPrice(context, stockDescription, apiKey, throttle) {
  //US ONLY
  if (stockDescription !== undefined && apiKey !== undefined && stockDescription.exchange === 'US') {
    const stockSymbol = stockDescription.symbol
    let stockPriceData = {};
    let that = context

    const queryString = `https://finnhub.io/api/v1/quote?symbol=${stockSymbol}&token=${apiKey}`
    finnHub(throttle, queryString)
      .then((data) => {
        if (data.error === 429) { //run again
          GetStockPrice(context, stockDescription, apiKey)
        } else {
        stockPriceData = {
          currentPrice: data.c, 
        };
        that.setState((prevState) => {
          // console.log("setting streamingPriceData")
          let newstreamingPriceData = Object.assign({}, prevState.streamingPriceData);
          newstreamingPriceData[`US-${stockSymbol}`] = stockPriceData;
          return { streamingPriceData: newstreamingPriceData };
          
        });
      }
      })
      .catch(error => {
        console.log(error.message)
        console.log(throttle)
      });
    }
  }

function LoadStockData(context, s, getStockPrice, throttle){
  // console.log("------loadStockPrice-------")
  if (Object.keys(s.globalStockList).length !== 0) {
    // console.log(s.globalStockList)
    // context.setState({ refreshStockData: 0 })
    for (const stock in s.globalStockList) {
      getStockPrice(context, s.globalStockList[stock], s.apiKey, throttle)
    }
  }
}

export {GetStockPrice, LoadStockData}