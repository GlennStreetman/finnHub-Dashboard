import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {finnHub} from "./../appFunctions/throttleQueue";
import { exchangeDataDB } from './indexedDB.js'


export const tGetSymbolList = createAsyncThunk(
    'newSymbolList',
    (reqObj, thunkAPI) => { //{exchange, apiKey, finnHub} Not passing thunk api as second arg.
        const finnQueue = thunkAPI.getState().finnHubQueue.throttle
        const apiString = `https://finnhub.io/api/v1/stock/symbol?exchange=${reqObj.exchange}&token=${reqObj.apiKey}`
        // console.log(apiString)
        return finnHub(finnQueue, apiString) //replace with usestate.
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
            //receives default exchange symbol, retrieves data from local, loads into redux state.
            const ap = reqObj
            // console.log('1ap', ap)
            const db = await exchangeDataDB() //open connection
            // console.log('2db', db)
            const value = await db.get('exchangeDB',ap) //get data
            // console.log('FINISHED', ap, value)
            const returnObj = {
                ex: ap,
                data: value
            }
            // console.log("-----------returning---------", returnObj)
            return (returnObj)
        })

const exchangeData = createSlice({
    name: 'exchangedata',
    initialState: {
        exchangeDB: exchangeDataDB
    },
    reducers: { 
            rUpdateExchangeData: (state, action) => {
                const ap = action.payload
                // console.log("UPDATING EXCHANGE LIST", ap)
                state.exchangeData = ap  
            },
    },      
    
    extraReducers: {
    [tGetSymbolList.pending]: (state) => {
        // console.log('1 getting stock data')
        return state
    },
    [tGetSymbolList.rejected]: (state, action) => {
        console.log('failed to retrieve stock data for: ', action)
        return state
    },
    [tGetSymbolList.fulfilled]: async(state, action) => {
        try {
            let data = action.payload
            const updateObj = {
                ex: data.exchange,
                data: data.data,
                updated: Date.now(),
            }
            // console.log('updateObj', updateObj, data)
            if (updateObj.ex !== undefined) {
                const db = await exchangeDataDB()

                db.put('exchangeDB',updateObj)
                // console.log('Added to store:', value, updateObj)
                // console.log(db)
            }
        } catch {console.log('failed to retrieve exchange data')}
        return state
        
    },

    [tUpdateExchangeData.pending]: (state) => {
        // console.log('1 getting exchange data')
        return {...state}
    },
    [tUpdateExchangeData.rejected]: (state, action) => {
        console.log('failed to retrieve exchange data for: ', action)
        return {...state}
    },
    [tUpdateExchangeData.fulfilled]: (state, action) => {
        // console.log('!3 FINISHED tUpdateExchangeData', action)
        // const apx = action.payload['ex']
        const apd = action.payload['data']
        // console.log('-----------apd--------------', apd)
        if (apd !== undefined) {state.exchangeData = apd} else {return {...state}}
    }
    }
})

export const {
    rUpdateExchangeData,
} = exchangeData.actions
export default exchangeData.reducer
