import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {finnHub} from "./../appFunctions/throttleQueue.js";

export const rGetSymbolList = createAsyncThunk(
    'newSymbolList',
    (reqObj) => { //{exchange, apiKey, finnHub} Not passing thunk api as second arg.
        // console.log("GETTING EXCHANGE DATA")
        const apiString = `https://finnhub.io/api/v1/stock/symbol?exchange=${reqObj.exchange}&token=${reqObj.apiKey}`
        // console.log(apiString)
        return finnHub(reqObj['throttle'], apiString)
        .then((data) => {
            if (data.error === 429) { //run again
                rGetSymbolList(reqObj)
                return {
                    'data': {}, 
                    'exchange': reqObj.exchange,
                }
            } else {
                let updateStockList = {}
                for (const stockObj in data) {
                    data[stockObj]['exchange'] = reqObj.exchange
                    let addStockKey = reqObj.exchange + "-" + data[stockObj]['symbol']
                    updateStockList[addStockKey] = data[stockObj]
                    updateStockList[addStockKey]['key'] = addStockKey
                }  
                return {
                    'data': updateStockList, 
                    'exchange': reqObj.exchange,
                }
            }
        })
    }
    )

const exchangeData = createSlice({
    name: 'exchangedata',
    initialState: {
        exchangeData: {}, //keys for  exchange data objects
    },
    reducers: { //reducers can reference eachother with slice.caseReducers.reducer(state)
        rUpdateExchangeData: (state, action) => {
            // const ap = action.payload
            const s = state
            return {...s, exchangeData: {}}}  
        },
    
    extraReducers: {
    [rGetSymbolList.pending]: (state) => {
        // console.log('1 getting stock data')
        return {...state}
    },
    [rGetSymbolList.rejected]: (state, action) => {
        console.log('failed to retrieve stock data for: ', action)
        return {...state}
    },
    [rGetSymbolList.fulfilled]: (state, action) => {
        // console.log("3updating stock data:", action.payload)
        return {...state, [action.payload.exchange]: action.payload.data}
    },
}
})

export const {
    rUpdateExchangeData,
} = exchangeData.actions
export default exchangeData.reducer
