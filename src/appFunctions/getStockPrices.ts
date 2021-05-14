import { finnHub, throttleApiReqObj, finnHubQueue } from "./appImport/throttleQueueAPI";
import { AppState, stock, streamingPriceData, priceObj } from './../App'

function GetStockPrice(context: any, stockDescription: stock, apiKey: string, throttle: finnHubQueue,) {
    //US ONLY
    if (stockDescription !== undefined && apiKey !== undefined && stockDescription.exchange === 'US') {
        const stockSymbol = stockDescription.symbol
        let stockPriceData: priceObj = { currentPrice: 0 };
        let that: any = context
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
                    that.setState((prevState: AppState) => {
                        let newstreamingPriceData: streamingPriceData = Object.assign({}, prevState.streamingPriceData);
                        const key: string = `US-${stockSymbol}`
                        newstreamingPriceData[key] = stockPriceData;
                        const payload: Partial<AppState> = { streamingPriceData: newstreamingPriceData }
                        return payload;
                    });
                }
            })
            .catch(error => {
                console.log(error.message)
            });
    }
}

function LoadStockData(context: any, s: AppState, getStockPrice: Function, throttle: finnHubQueue) {
    if (Object.keys(s.globalStockList).length !== 0) {
        for (const stock in s.globalStockList) {
            getStockPrice(context, s.globalStockList[stock], s.apiKey, throttle)
        }
    }
}

export { GetStockPrice, LoadStockData }