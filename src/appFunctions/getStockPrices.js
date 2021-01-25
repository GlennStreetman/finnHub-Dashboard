import {finnHub} from "./throttleQueue.js";

function GetStockPrice(context, stockDescription, apiKey, throttle) {
  //US ONLY
  if (stockDescription !== undefined && apiKey !== undefined && stockDescription.exchange === 'US') {
    const stockSymbol = stockDescription.symbol
    let stockPriceData = {};
    let that = context
    
    const queryString = `https://finnhub.io/api/v1/quote?symbol=${stockSymbol}&token=${apiKey}`
    finnHub(throttle, queryString)
      .then((data) => {
        // console.log("updating stock data")
        const {
          c: a, //current price
          // h: b, //current days high price
          // l: c, //current days low price
          // o: d, //current days open price
          // pc: e, //previous days close price
        } = data;
        //create object from destructured data above.
        stockPriceData = {
          currentPrice: a, 
          // dayHighPrice: b,
          // dayLowPrice: c,
          // dayOpenPrice: d,
          // prevClosePrice: e,
        };

        that.setState((prevState) => {
          // console.log("setting streamingPriceData")
          let newstreamingPriceData = Object.assign({}, prevState.streamingPriceData);
          newstreamingPriceData[`US-${stockSymbol}`] = stockPriceData;
          return { streamingPriceData: newstreamingPriceData };
        });
      })
      .catch(error => {
        console.log(error.message)
      });
    }
  }

function LoadStockData(context, s, getStockPrice){
  // console.log("------loadStockPrice-------")
  if (Object.keys(s.globalStockList).length !== 0) {
    // console.log(s.globalStockList)
    // context.setState({ refreshStockData: 0 })
    for (const stock in s.globalStockList) {
      getStockPrice(context, s.globalStockList[stock], s.apiKey, s.throttle)
    }
  }
}

export {GetStockPrice, LoadStockData}