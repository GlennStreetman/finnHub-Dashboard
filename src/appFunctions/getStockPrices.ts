import { finnHub, throttleApiReqObj } from "./appImport/throttleQueueAPI";

function GetStockPrice(context, stockDescription, apiKey, throttle) {
  //US ONLY
  if (stockDescription !== undefined && apiKey !== undefined && stockDescription.exchange === 'US') {
    const stockSymbol = stockDescription.symbol
    let stockPriceData = {};
    let that = context
    const queryString = `https://finnhub.io/api/v1/quote?symbol=${stockSymbol}&token=${apiKey}`
    const reqObj: throttleApiReqObj = {
      apiString: queryString,
      widgetName: 'pass',
      dashboard: 'pass',
      widgetType: 'pass',
      config: {},
      widget: 'pass',
      security: stockSymbol,
    }
    finnHub(throttle, reqObj)
      .then((data: any) => {
        if (data.error === 429) { //run again
          GetStockPrice(context, stockDescription, apiKey, throttle)
        } else {
          stockPriceData = {
            currentPrice: data?.data?.c,
          };
          that.setState((prevState) => {
            let newstreamingPriceData = Object.assign({}, prevState.streamingPriceData);
            newstreamingPriceData[`US-${stockSymbol}`] = stockPriceData;
            return { streamingPriceData: newstreamingPriceData };

          });
        }
      })
      .catch(error => {
        console.log(error.message)
      });
  }
}

function LoadStockData(context, s, getStockPrice, throttle) {
  if (Object.keys(s.globalStockList).length !== 0) {
    for (const stock in s.globalStockList) {
      getStockPrice(context, s.globalStockList[stock], s.apiKey, throttle)
    }
  }
}

export { GetStockPrice, LoadStockData }