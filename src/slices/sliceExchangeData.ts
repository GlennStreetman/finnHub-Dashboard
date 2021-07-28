import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { finnHub, throttleApiReqObj, finnHubQueue } from "../appFunctions/appImport/throttleQueueAPI";

export interface reqObj {
    exchange: string,
    apiKey: string,
    finnHubQueue: finnHubQueue,
}

interface resObj {
    data: stockObj,
    ex: string,
}

interface stockObj {
    [key: string]: stockNode
}

interface stockNode {
    currency: string,
    description: string,
    displaySymbol: string,
    exchange: string,
    figi: string,
    key: string,
    mic: string,
    symbol: string,
    type: string,
}

interface DataNode {
    ex?: string,
    data?: stockObj,
    updated?: number,
}

export interface sliceExchangeData {
    e: DataNode,
    exchangeData?: Object
}

const initialState: sliceExchangeData = {
    e: {},
}

export const tGetSymbolList = createAsyncThunk(
    'newSymbolList',
    (reqObj: reqObj, thunkAPI: any) => {
        const finnQueue = reqObj.finnHubQueue
        const apiString = `https://finnhub.io/api/v1/stock/symbol?exchange=${reqObj.exchange}&token=${reqObj.apiKey}`
        const thisReq: throttleApiReqObj = {
            dashboardID: 'pass',
            apiString: apiString,
            widgetName: 'pass',
            dashboard: 'pass',
            widgetType: 'pass',
            config: {},
            widget: 'pass',
            security: reqObj.exchange,
            rSetUpdateStatus: (a) => { }
        }

        return finnHub(finnQueue, thisReq) //replace with usestate.
            .then((data: any) => {
                if (data.error === 429) { //add back into queue if 429
                    tGetSymbolList(reqObj)
                    const resObj: resObj = {
                        'data': {},
                        'ex': reqObj.exchange,
                    }
                    return (resObj)
                } else {
                    let updateStockList: stockObj = {}
                    const stockData = data.data
                    for (const stockObj in stockData) {
                        stockData[stockObj]['exchange'] = reqObj.exchange
                        let addStockKey = reqObj.exchange + "-" + stockData[stockObj]['symbol']
                        updateStockList[addStockKey] = stockData[stockObj]
                        updateStockList[addStockKey]['key'] = addStockKey
                    }
                    const resObj: resObj = {
                        'data': updateStockList,
                        'ex': reqObj.exchange,
                    }
                    return (resObj)
                }
            })
    }
)

const exchangeData = createSlice({
    name: 'exchangedata',
    initialState,
    reducers: {
        rUpdateExchangeData: (state, action) => {
            const ap = action.payload
            state.exchangeData = ap
        },
        rExchangeDataLogout: (state) => {
            state.e = {}
        }
    },

    extraReducers: {
        [tGetSymbolList.pending.toString()]: (state) => {
            return state
        },
        [tGetSymbolList.rejected.toString()]: (state, action) => {
            console.log('failed to retrieve stock data for: ', action)
            return state
        },
        [tGetSymbolList.fulfilled.toString()]: (state, action) => {
            try {
                let data = action.payload
                const updateObj: DataNode = {
                    ex: data.ex,
                    data: data.data,
                    updated: Date.now(),
                }
                if (updateObj.ex !== undefined) {
                    state.e = updateObj
                }
            } catch {
                console.log('failed to retrieve exchange data')
            }

        }
    }
})

export const {
    rUpdateExchangeData,
    rExchangeDataLogout
} = exchangeData.actions
export default exchangeData.reducer
