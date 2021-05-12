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

export const tGetSymbolList = createAsyncThunk(
    'newSymbolList',
    (reqObj: reqObj, thunkAPI: any) => { //{exchange, apiKey}
        console.log(reqObj)
        const finnQueue = reqObj.finnHubQueue
        const apiString = `https://finnhub.io/api/v1/stock/symbol?exchange=${reqObj.exchange}&token=${reqObj.apiKey}`
        const thisReq: throttleApiReqObj = {
            apiString: apiString,
            widgetName: 'pass',
            dashboard: 'pass',
            widgetType: 'pass',
            config: {},
            widget: 'pass',
            security: reqObj.exchange,
        }

        return finnHub(finnQueue, thisReq) //replace with usestate.
            .then((data: any) => {
                console.log('BROKEN')
                if (data.error === 429) { //add back into queue if 429
                    tGetSymbolList(reqObj)
                    const resObj: resObj = {
                        'data': {},
                        'ex': reqObj.exchange,
                    }
                    return (resObj)
                } else {
                    console.log('working')
                    let updateStockList = {}
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

interface DataNode {
    ex?: string,
    data?: stockObj,
    updated?: number,
}

interface DataSet {
    e: DataNode,
    exchangeData?: Object
}

const initialState: DataSet = {
    e: {},
}

const exchangeData = createSlice({
    name: 'exchangedata',
    initialState,
    reducers: {
        rUpdateExchangeData: (state, action) => {
            const ap = action.payload

            state.exchangeData = ap
        },
    },

    extraReducers: {
        // @ts-ignore: Unreachable code error
        [tGetSymbolList.pending]: (state) => {
            return state
        },
        // @ts-ignore: Unreachable code error
        [tGetSymbolList.rejected]: (state, action) => {
            console.log('failed to retrieve stock data for: ', action)
            return state
        },
        // @ts-ignore: Unreachable code error
        [tGetSymbolList.fulfilled]: (state, action) => {
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
} = exchangeData.actions
export default exchangeData.reducer
