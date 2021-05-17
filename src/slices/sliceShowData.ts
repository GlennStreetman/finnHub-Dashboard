import { createSlice } from '@reduxjs/toolkit';
import { tGetMongoDB } from '../thunks/thunkGetMongoDB'
import { tSearchMongoDB } from '../thunks/thunkSearchMongoDB'
import { tGetFinnhubData, resObj } from '../thunks/thunkFetchFinnhub'

//data = {keys : data objects}
//key should be widget reference.

interface DataNode {
    [key: string]: Object,
}

export interface sliceShowData {
    dataSet: { [key: string]: DataNode },
    targetDashboard: string,
}

export interface rSetTargetDashboardPayload {
    targetDashboard: string
}

interface rSetTargetDashboardArgs {
    payload: rSetTargetDashboardPayload
}

const initialState: sliceShowData = {
    dataSet: {},
    targetDashboard: '',
}



const showData = createSlice({
    name: 'showData',
    initialState,
    reducers: {
        rBuildVisableData: (state, action) => {
            //adds new key that is populated by data later.
            //payload {key: string, {...widget-ex-stck: {empty obj}}}
            // console.log('rBuildVisableData', action.payload)
            const ap: any = action.payload
            const key: string = ap.key
            state.dataSet[key] = {}
            for (const security in ap.securityList) {
                const thisSecurity: string = ap.securityList[security]
                state.dataSet[key][thisSecurity] = {}
            }
        },
        rSetTargetDashboard: (state, action: rSetTargetDashboardArgs) => { //{targetDashboard}
            const target = action.payload.targetDashboard
            // console.log('target', target, action.payload)
            state.targetDashboard = target
        },
        rTargetDashboardLogout: (state) => {
            state.dataSet = {}
            state.targetDashboard = ''
        }

    },
    extraReducers: {
        // @ts-ignore: Unreachable code error
        [tGetFinnhubData.pending]: (state, action) => {
            // console.log('1. Getting stock data!')
            // return {...state}
        },
        // @ts-ignore: Unreachable code error
        [tGetFinnhubData.rejected]: (state, action) => {
            console.log('2. failed get data from Finnhub: ')
            // return {...state}
        },
        // @ts-ignore: Unreachable code error
        [tGetFinnhubData.fulfilled]: (state, action) => {
            // console.log("Merge fresh finnHub data into showData", action.payload)
            const ap: resObj = action.payload
            for (const key in ap) {
                if (ap[key].dashboard === state.targetDashboard) {
                    // console.log("updating visable data", ap[key])
                    const widgetRef: string = ap[key].widget
                    const security: string = ap[key].security
                    // console.log(key, widgetRef, security)
                    if (state.dataSet[widgetRef] !== undefined &&
                        state.dataSet[widgetRef][security] !== undefined) {
                        // console.log('MERGE FINAL', widgetRef, security, ap[key].data)
                        state.dataSet[widgetRef][security] = ap[key].data
                    }
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
            console.log('2. failed showData from Mongo: ', action)
            // return {...state}
        },
        // @ts-ignore: Unreachable code error
        [tGetMongoDB.fulfilled]: (state, action) => {
            // console.log("Merge fresh mongoDB data into showData", action.payload)
            const ap: any = action.payload
            for (const x in ap) {
                if (ap[x].dashboard === state.targetDashboard) {
                    const widgetRef: string = ap[x].widget
                    const security: string = ap[x].security
                    // console.log(widgetRef, security)
                    if (state.dataSet[widgetRef] !== undefined &&
                        state.dataSet[widgetRef][security] !== undefined) {
                        // console.log('HERE', widgetRef, security)
                        state.dataSet[widgetRef][security] = ap[x].data
                    }
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
            console.log('2. failed to find data from Mongo: ', action)
            // return {...state}
        },
        // @ts-ignore: Unreachable code error
        [tSearchMongoDB.fulfilled]: (state, action) => {

            const ap: any = action.payload
            // console.log("Merge found data from Mongo", ap)
            for (const x in ap) {
                const widgetRef: string = ap[x].widget
                const security: string = ap[x].security
                if (state.dataSet[widgetRef] !== undefined &&
                    state.dataSet[widgetRef][security] !== undefined) {
                    state.dataSet[widgetRef][security] = ap[x].data
                }
            }
        },
    }
})


export const {
    rTargetDashboardLogout,
    rBuildVisableData,
    rSetTargetDashboard,
} = showData.actions
export default showData.reducer

