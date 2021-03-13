import { createSlice } from '@reduxjs/toolkit';
import {tGetMongoDB} from '../thunks/thunkGetMongoDB.js'
import {tSearchMongoDB} from './../thunks/thunkSearchMongoDB.js'
import {tGetFinnhubData} from './../thunks/thunkFetchFinnhub.js'

//data = {keys : data objects}
//key should be widget reference.

const showData = createSlice({
    name: 'showData',
    initialState: {
        dataSet: {}, //widgetKey: {...securities: {}}
    }, 
    reducers: {
        rSetVisableData: (state, action) => {
            //payload = {key: "string", data: {}}
            //if key exists set data
            const ap = action.payload
            if (state.dataSet[ap.key]) {state.dataSet[ap.key] = ap.data}
        },
        rBuildVisableData: (state, action) => {
            //adds new key that is populated by data later.
            //payload {key: string, {...widget-ex-stck: {empty obj}}}
            // console.log('rBuildVisableData', action.payload)
            const ap = action.payload 
            for (const security in ap) {
                state.dataSet[ap.key] = {}
                state.dataSet[ap.key][ap[security]] = {}
            }
        },
        rResetVisableData: (state, action) => {
            //resets state after loading new dataset.
            state.dataSet = {}
        },
        
    }, 
    extraReducers: {
        [tGetFinnhubData.pending]: (state, action) => {
            // console.log('1. Getting stock data!')
            // return {...state}
        },
        [tGetFinnhubData.rejected]: (state, action) => {
            console.log('2. failed get data from Finnhub: ', action)
            // return {...state}
        },
        [tGetFinnhubData.fulfilled]: (state, action) => {
            console.log("Merge fresh finnHub data into showData", action.payload)
            const ap = action.payload
            for (const key in ap) {
                const apiString = key
                const widgetRef = apiString.slice(0,apiString.indexOf('-'))
                const security = apiString.slice(apiString.indexOf('-')+1,  apiString.length)
                console.log(key, widgetRef, security)
                if (state.dataSet[widgetRef] !== undefined &&
                    state.dataSet[widgetRef][security] !== undefined) {
                    console.log('MERGE FINAL', widgetRef, security, ap[key].data)
                    state.dataSet[widgetRef][security] = ap[key].data
                }
            }
        },
        [tGetMongoDB.pending]: (state, action) => {
            // console.log('1. Getting stock data!')
            // return {...state}
        },
        [tGetMongoDB.rejected]: (state, action) => {
            console.log('2. failed showData from Mongo: ', action)
            // return {...state}
        },
        [tGetMongoDB.fulfilled]: (state, action) => {
            console.log("Merge fresh mongoDB data into showData")
            const ap = action.payload
            for (const x in ap) {
                const apiString = ap[x].key
                const widgetRef = apiString.slice(0,apiString.indexOf('-')) 
                const security = apiString.slice(apiString.indexOf('-')+1, apiString.length) 
                // console.log(widgetRef, security)
                if (state.dataSet[widgetRef] !== undefined && 
                state.dataSet[widgetRef][security] !== undefined) {
                    // console.log('HERE', widgetRef, security)
                    state.dataSet[widgetRef][security] = ap[x].data
                }
            }
        },

        [tSearchMongoDB.pending]: (state, action) => {
            // console.log('1. Getting stock data!')
            // return {...state}
        },
        [tSearchMongoDB.rejected]: (state, action) => {
            console.log('2. failed to find data from Mongo: ', action)
            // return {...state}
        },
        [tSearchMongoDB.fulfilled]: (state, action) => {
            
            const ap = action.payload
            console.log("Merge found data from Mongo", ap)
            for (const x in ap) {
                const apiString = ap[x].key
                const widgetRef = apiString.slice(0,apiString.indexOf('-'))
                const security = apiString.slice(apiString.indexOf('-')+1,  apiString.length)
                if (state.dataSet[widgetRef] !== undefined &&
                    state.dataSet[widgetRef][security] !== undefined) {
                    state.dataSet[widgetRef][security] = ap[x].data
                }
            }
        },
    }
})
// })

export const {
    rSetVisableData,
    rBuildVisableData,
    rResetVisableData,
} = showData.actions
export default showData.reducer

