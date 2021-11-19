import { createAsyncThunk } from '@reduxjs/toolkit';
import { stock } from './../App'
import { finnHub, finnHubQueue } from "./../appFunctions/appImport/throttleQueueAPI";

//receives list of strings to search for.
//pushes returned string to visableData in redux.

interface tGetQuotePricesReq {
    stock: stock,
    apiKey: string,
    throttle: finnHubQueue
}

export const tgetQuotePrices = createAsyncThunk( //{dashboard, [securityList]}
    'tGetQuotePrices',
    (reqObj: tGetQuotePricesReq, thunkAPI: any) => { //{list of securities}

        const stockObj = reqObj.stock
        const apiKey = reqObj.apiKey
        const throttle = reqObj.throttle

        const rQuote = thunkAPI.getState().quotePrice.quote

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

                const res: any = finnHub(throttle, reqObj)
                    .then((data: any) => {
                        if (data.error === 429) { //run again, api rate limit exceeded.
                            return tgetQuotePrices({
                                stock: stockObj,
                                apiKey: apiKey,
                                throttle: throttle
                            })
                        } else {
                            let payload = [stockObj.key, data?.data?.c] //tuple
                            return payload
                        }

                    })
                    .catch(error => {
                        console.log('tGetQuotePrices error:', error.message)
                    });
                return res
            }
        }
    })
