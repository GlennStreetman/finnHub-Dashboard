import { createSlice } from '@reduxjs/toolkit';
import {tFinnHubDataMongo} from './../thunks/thunkCheckMongoDB.js'

//data = {keys : data objects}
//key should be widget reference.

const showData = createSlice({
    name: 'showData',
    initialState: {
        dataSet: {},
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
            state.dataSet[ap.key] = {}
        },
        rResetVisableData: (state, action) => {
            //resets state after loading new dataset.
            state.dataSet = {}
        },
        
    }, 
    extraReducers: {
        [tFinnHubDataMongo.pending]: (state, action) => {
            // console.log('1. Getting stock data!')
            // return {...state}
        },
        [tFinnHubDataMongo.rejected]: (state, action) => {
            console.log('2. failed showData from Mongo: ', action)
            // return {...state}
        },
        [tFinnHubDataMongo.fulfilled]: (state, action) => {
            console.log("Merge fresh mongoDB data into showData")
            const ap = action.payload
            for (const x in ap) {
                const apiString = ap[x].key
                const widgetRef = apiString.slice(0,apiString.indexOf('-')) 
                if (state.dataSet[widgetRef] !== undefined) {
                    state.dataSet[widgetRef] = ap[x].data
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

