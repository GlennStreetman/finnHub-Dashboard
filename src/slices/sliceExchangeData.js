import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {finnHub} from "./../appFunctions/throttleQueue.js";
import { exchangeDataDB } from './indexedDB.js'


export const tGetSymbolList = createAsyncThunk(
    'newSymbolList',
    (reqObj) => { //{exchange, apiKey, finnHub} Not passing thunk api as second arg.
        
        const apiString = `https://finnhub.io/api/v1/stock/symbol?exchange=${reqObj.exchange}&token=${reqObj.apiKey}`
        // console.log(apiString)
        return finnHub(reqObj['throttle'], apiString)
        .then((data) => {
            if (data.error === 429) { //run again
                tGetSymbolList(reqObj)
                return {
                    'data': {}, 
                    'ex': exchangeDataDB,
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

export const tUpdateExchangeData = createAsyncThunk(
        'getSymbolList',
        async (reqObj, thunkAPI) => {
            const ap = reqObj
            console.log('ap', ap)
            const db = await exchangeDataDB()
            console.log('db', db)
            // const store = db.transaction('exchangeDB').objectStore('exchangeDB')
            // console.log('store', store)
            const value = await db.get('exchangeDB',ap)
            console.log('FINISHED', ap, value)
            return (value)
        })

const exchangeData = createSlice({
    name: 'exchangedata',
    initialState: {
        exchangeDB: exchangeDataDB
    },
    reducers: { 
            // rUpdateExchangeData: (state, action) => {
            //     // const ap = action.payload
            //     // const s = state
            //     state.exchangeData = {}  
            // },
    },      
    
    extraReducers: {
    [tGetSymbolList.pending]: (state) => {
        console.log('1 getting stock data')
        return state
    },
    [tGetSymbolList.rejected]: (state, action) => {
        console.log('failed to retrieve stock data for: ', action)
        return state
    },
    [tGetSymbolList.fulfilled]: async(state, action) => {

        let data = action.payload
        const updateObj = {
            ex: data.exchange,
            data: data.data,
            updated: Date.now(),
        }
        console.log(updateObj)

        const db = await exchangeDataDB()
        // const store = db.transaction('exchangeDB').objectStore('exchangeDB')
        const value = (db.add('exchangeDB',updateObj)) || 0
        console.log('Added to store:', value)
        console.log(db)
        return state
        
    },

    [tUpdateExchangeData.pending]: (state) => {
        console.log('1 getting exchange data')
        return {...state}
    },
    [tUpdateExchangeData.rejected]: (state, action) => {
        console.log('failed to retrieve exchange data for: ', action)
        return {...state}
    },
    [tUpdateExchangeData.fulfilled]: (state, action) => {
        console.log('!3 FINISHED tUpdateExchangeData', action)
        // const apx = action.payload['ex']
        const apd = action.payload['data']
        let returnObj = apd
        state.exchangeData = returnObj
    }
    }
})

export const {
    rUpdateExchangeData,
} = exchangeData.actions
export default exchangeData.reducer
