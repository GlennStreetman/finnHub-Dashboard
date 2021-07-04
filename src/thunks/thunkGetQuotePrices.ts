import { createAsyncThunk } from '@reduxjs/toolkit';
import { stock } from './../App'
import { finnHub, throttleApiReqObj, finnHubQueue } from "./../appFunctions/appImport/throttleQueueAPI";

//receives list of strings to search for.
//pushes returned string to visableData in redux.

interface tGetQuotePricesReq {
    stock: stock,
    apiKey: string,
    throttle: finnHubQueue
}

// export function getQuotePrices(reqObj: tGetQuotePricesReq){
//     const globalStockList = reqObj.globalStockList
//     if (Object.keys(globalStockList).length !== 0) {
//         for (const stock in globalStockList) {
//             tgetQuotePrices(stock, reqObj.apiKey, reqObj.throttle)
//         }
// }

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
                const reqObj: throttleApiReqObj = {
                    apiString: queryString,
                    widgetName: 'pass',
                    dashboard: 'pass',
                    widgetType: 'pass',
                    config: {},
                    widget: 'pass',
                    security: stockSymbol,
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
                    console.log('process payload', payload)
                    return payload
                }
            }
        }
        // }
        // }
    })
