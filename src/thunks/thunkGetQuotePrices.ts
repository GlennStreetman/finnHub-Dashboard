import { createAsyncThunk } from '@reduxjs/toolkit';
import { stock } from './../slices/sliceDashboardData'
import { finnHub, finnHubQueue } from "./../appFunctions/appImport/throttleQueueAPI";



interface tGetQuotePricesReq {
    stock: stock,
    apiKey: string,
    throttle: finnHubQueue
}

export const tgetQuotePrices = createAsyncThunk( //{dashboard, [securityList]}
    'tGetQuotePrices',
    async (reqObj: tGetQuotePricesReq, thunkAPI: any) => { //{list of securities}

        const stockObj = reqObj.stock
        const apiKey = reqObj.apiKey
        const throttle = reqObj.throttle

        const rQuote = thunkAPI.getState().quotePrice.quote

        // if (Object.keys(globalStockList).length !== 0) {
        // for (const stock in globalStockList) {
        if (!rQuote[stockObj.key]) {
            if (stockObj !== undefined && apiKey !== undefined && stockObj.exchange === 'US') {
                const stockSymbol = stockObj.symbol
                const queryString = `https://finnhub.io/api/v1/quote?symbol=${stockSymbol}&token=${apiKey}`
                const reqObj: any = {
                    apiString: queryString,
                    widgetName: 'pass',
                    dashboard: 'pass',
                    widgetType: 'pass',
                    config: {},
                    widget: 'pass',
                    security: stockSymbol,
                    rSetUpdateStatus: (a) => { }
                }
                const data: any = await finnHub(throttle, reqObj)
                    .catch(error => {
                        console.log('tGetQuotePrices error:', error.message)
                    });
                if (data.error === 429) { //run again, api rate limit exceeded.
                    tgetQuotePrices({
                        stock: stockObj,
                        apiKey: apiKey,
                        throttle: throttle
                    })
                } else {
                    let payload = [stockObj.key, data?.data?.c] //tuple
                    return payload
                }
            }
        }
    })
