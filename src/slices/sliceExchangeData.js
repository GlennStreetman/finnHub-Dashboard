import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {finnHub} from "./../appFunctions/throttleQueue.js";

export const getSymbolList = createAsyncThunk(
    'newSymbolList',
    (reqObj) => { //{exchange, apiKey, finnHub} Not passing thunk api as second arg.
        
        console.log(reqObj, "-------request object")
        const apiString = `https://finnhub.io/api/v1/stock/symbol?exchange=${reqObj.exchange}&token=${reqObj.apiKey}`
        console.log(apiString)
        return finnHub(reqObj['throttle'], apiString)
        .then((data) => {
            console.log("thunk completing")
            let updateStockList = {}
            for (const stockObj in data) {
                data[stockObj]['exchange'] = reqObj.exchange
                let addStockKey = reqObj.exchange + "-" + data[stockObj]['symbol']
                updateStockList[addStockKey] = data[stockObj]
                updateStockList[addStockKey]['key'] = addStockKey
            }  
            return {
                'data': data, 
                'exchange': reqObj.exchange,
            }
        })
    }
    )


const exchangeData = createSlice({
    name: 'exchangedata',
    initialState: {
        exchangeList: [], //list of active exchanges
    },
    reducers: { //reducers can reference eachother with slice.caseReducers.reducer(state)
        updateExchange: (state, action) => {
            const ap = action.payload
            const s = state
            return {...s, exchangeList: ap.exchangeList}  
        },
    },
    
    extraReducers: {
    [getSymbolList.pending]: (state) => {
        console.log('getting stock data')
        return {...state}
    },
    [getSymbolList.rejected]: (state, action) => {
        console.log('failed to retrieve stock data for: ', action)
        return {...state}
    },
    [getSymbolList.fulfilled]: (state, action) => {
        console.log("updating stock data:", action.payload)
        return {...state, [action.payload.exchange]: action.payload.data}
    },
}
})

export const {
    updateExchange,
} = exchangeData.actions
export default exchangeData.reducer


//   updateStockList[addStockKey]['dStock'] = function(ex){
//     if (ex.length === 1) {
//       return (this.symbol)
//     } else {
//       return (this.key)
//     }
//   }

//   updateStockList[addStockKey]['keys'] = function(){
//     return Object.keys(this)
//   }
  