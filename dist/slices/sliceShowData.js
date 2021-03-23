import { createSlice } from '@reduxjs/toolkit';
import { tGetMongoDB } from '../thunks/thunkGetMongoDB.js';
import { tSearchMongoDB } from '../thunks/thunkSearchMongoDB.js';
import { tGetFinnhubData } from '../thunks/thunkFetchFinnhub.js';
const initialState = {
    dataSet: {}
};
const showData = createSlice({
    name: 'showData',
    initialState,
    reducers: {
        rSetVisableData: (state, action) => {
            //payload = {key: "string", data: {}}
            //if key exists set data
            const ap = action.payload;
            const key = ap.key;
            const data = ap.data;
            if (state.dataSet[key]) {
                state.dataSet[key] = data;
            }
        },
        rBuildVisableData: (state, action) => {
            //adds new key that is populated by data later.
            //payload {key: string, {...widget-ex-stck: {empty obj}}}
            // console.log('rBuildVisableData', action.payload)
            const ap = action.payload;
            const key = ap.key;
            state.dataSet[key] = {};
            for (const security in ap.securityList) {
                const thisSecurity = ap.securityList[security];
                state.dataSet[key][thisSecurity] = {};
            }
        },
        rResetVisableData: (state, action) => {
            //resets state after loading new dataset.
            state.dataSet = {};
        },
    },
    extraReducers: {
        // @ts-ignore: Unreachable code error
        [tGetFinnhubData.pending]: (state, action) => {
            // console.log('1. Getting stock data!')
            // return {...state}
        },
        // @ts-ignore: Unreachable code error
        [tGetFinnhubData.rejected]: (state, action) => {
            console.log('2. failed get data from Finnhub: ', action);
            // return {...state}
        },
        // @ts-ignore: Unreachable code error
        [tGetFinnhubData.fulfilled]: (state, action) => {
            // console.log("Merge fresh finnHub data into showData", action.payload)
            const ap = action.payload;
            for (const key in ap) {
                const apiString = key;
                const widgetRef = apiString.slice(0, apiString.indexOf('-'));
                const security = apiString.slice(apiString.indexOf('-') + 1, apiString.length);
                // console.log(key, widgetRef, security)
                if (state.dataSet[widgetRef] !== undefined &&
                    state.dataSet[widgetRef][security] !== undefined) {
                    // console.log('MERGE FINAL', widgetRef, security, ap[key].data)
                    state.dataSet[widgetRef][security] = ap[key].data;
                }
            }
        },
        // @ts-ignore: Unreachable code error
        [tGetMongoDB.pending]: (state, action) => {
            // console.log('1. Getting stock data!')
            // return {...state}
        },
        // @ts-ignore: Unreachable code error
        [tGetMongoDB.rejected]: (state, action) => {
            console.log('2. failed showData from Mongo: ', action);
            // return {...state}
        },
        // @ts-ignore: Unreachable code error
        [tGetMongoDB.fulfilled]: (state, action) => {
            // console.log("Merge fresh mongoDB data into showData")
            const ap = action.payload;
            for (const x in ap) {
                const apiString = ap[x].key;
                const widgetRef = apiString.slice(0, apiString.indexOf('-'));
                const security = apiString.slice(apiString.indexOf('-') + 1, apiString.length);
                // console.log(widgetRef, security)
                if (state.dataSet[widgetRef] !== undefined &&
                    state.dataSet[widgetRef][security] !== undefined) {
                    // console.log('HERE', widgetRef, security)
                    state.dataSet[widgetRef][security] = ap[x].data;
                }
            }
        },
        // @ts-ignore: Unreachable code error
        [tSearchMongoDB.pending]: (state, action) => {
            // console.log('1. Getting stock data!')
            // return {...state}
        },
        // @ts-ignore: Unreachable code error
        [tSearchMongoDB.rejected]: (state, action) => {
            console.log('2. failed to find data from Mongo: ', action);
            // return {...state}
        },
        // @ts-ignore: Unreachable code error
        [tSearchMongoDB.fulfilled]: (state, action) => {
            const ap = action.payload;
            // console.log("Merge found data from Mongo", ap)
            for (const x in ap) {
                const apiString = ap[x].key;
                const widgetRef = apiString.slice(0, apiString.indexOf('-'));
                const security = apiString.slice(apiString.indexOf('-') + 1, apiString.length);
                if (state.dataSet[widgetRef] !== undefined &&
                    state.dataSet[widgetRef][security] !== undefined) {
                    state.dataSet[widgetRef][security] = ap[x].data;
                }
            }
        },
    }
});
// })
export const { rSetVisableData, rBuildVisableData, rResetVisableData, } = showData.actions;
export default showData.reducer;
