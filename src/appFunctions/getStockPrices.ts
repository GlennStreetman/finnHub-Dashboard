import { finnHub, throttleApiReqObj, finnHubQueue } from "./appImport/throttleQueueAPI";
import { AppState, stock } from './../App'
import { rUpdarUpdateQuotePricePayload } from './../slices/sliceQuotePrice'

function GetStockPrice(context: any, stockObj: stock, apiKey: string, throttle: finnHubQueue,) {

    //US ONLY
    if (stockObj !== undefined && apiKey !== undefined && stockObj.exchange === 'US') {
        console.log('getting stock price:', stockObj)
        const stockSymbol = stockObj.symbol
        // let stockPriceData: priceObj = { currentPrice: 0 };
        // let that: any = context
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
                if (data.error === 429) { //run again, api rate limit exceeded.
                    GetStockPrice(context, stockObj, apiKey, throttle)
                } else {
                    console.log('GO')
                    let payload: rUpdarUpdateQuotePricePayload = { [stockObj.key]: data?.data?.c }
                    context.props.rUpdateQuotePriceSetup(payload)
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