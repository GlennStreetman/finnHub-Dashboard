import { createSlice } from '@reduxjs/toolkit';
import { tGetMongoDB } from '../thunks/thunkGetMongoDB'
import { tSearchMongoDB } from '../thunks/thunkSearchMongoDB'
import { tGetFinnhubData, resObj } from '../thunks/thunkFetchFinnhub'
// import { findByString, mergeByString } from './../appFunctions/stringFunctions'
import { widgetReducers } from '../registers/dataReducerReg'
import { tGetSavedDashboards } from '../thunks/thunkGetSavedDashboards'

//data = {keys : data objects}
//key should be widget reference.

interface DataNode {
    [key: string]: any
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


export interface rBuildVisableDataPayload {
    key: string, //widget Key
    securityList: string[], //list of securities
    dataFilters?: string[] //used to filter data if finnHubData over queries.Each string should start with reference to a security.
}

export interface rUnmountWidgetPayload {
    widgetKey: string
}

const showData = createSlice({
    name: 'showData',
    initialState,
    reducers: {
        rBuildVisableData: (state, action) => { //runs on load dashboard(all), syncFocusAll(all), syncFocusWidget(widget)
            //adds new key that is populated by data later.
            //payload {key: string, {...widget-ex-stck: {empty obj}}}
            const ap: rBuildVisableDataPayload = action.payload
            const key: string = ap.key
            state.dataSet[key] = {}
            for (const security in ap.securityList) {
                const thisSecurity: string = ap.securityList[security]
                state.dataSet[key][thisSecurity] = {}
            }
            if (ap.dataFilters) {
                for (const [sec, values] of Object.entries(ap.dataFilters)) {
                    if (state?.dataSet?.[key]?.[sec]) state.dataSet[key][sec]['filters'] = values
                }
            }
        },
        rSetTargetDashboard: (state, action: rSetTargetDashboardArgs) => { //{targetDashboard}
            const target = action.payload.targetDashboard
            state.targetDashboard = target
        },
        rTargetDashboardLogout: (state) => {
            state.dataSet = {}
            state.targetDashboard = ''
        },
        rUnmountWidget: (state, action) => {
            const ap: rUnmountWidgetPayload = action.payload
            delete state?.dataSet?.[ap.widgetKey]
        },
    },
    extraReducers: {
        [tGetFinnhubData.pending.toString()]: (state, action) => {
            // console.log('1. Getting stock data!')
            // return {...state}
        },
        [tGetFinnhubData.rejected.toString()]: (state, action) => {
            console.log('2. failed get data from Finnhub: ')
            // return {...state}
        },
        [tGetFinnhubData.fulfilled.toString()]: (state, action) => {
            // console.log('tGetFinnhubData', action.payload)
            const ap: resObj = action.payload
            for (const x in ap) {
                if (ap[x].dashboard === state.targetDashboard) {
                    const widgetRef: string = ap[x].widget
                    const security: string = ap[x].security
                    const data: object = ap[x].data
                    const widgetType = ap[x].widgetType
                    if (state?.dataSet?.[widgetRef]?.[security] !== undefined) {
                        const secObj: DataNode = state.dataSet[widgetRef][security]
                        if (widgetReducers[widgetType] !== undefined) { //IF Reducers need to be applied to finnHub API data for formatting or performance
                            let filteredDataFunc = widgetReducers[widgetType]
                            let filteredData = filteredDataFunc(data, secObj.filters)
                            filteredData.filters = secObj.filters
                            state.dataSet[widgetRef][security] = filteredData
                        } else { //no filters
                            state.dataSet[widgetRef][security] = ap[x].data
                        }
                    }
                }
            }
        },
        [tGetMongoDB.pending.toString()]: (state, action) => {
            // console.log('1. Getting stock data!')
            // return {...state}
        },
        [tGetMongoDB.rejected.toString()]: (state, action) => {
            console.log('2. failed showData from Mongo: ', action)
            // return {...state}
        },
        [tGetMongoDB.fulfilled.toString()]: (state, action) => {
            const ap: any = action.payload
            for (const x in ap) { //FOR 'DB-WIdget-security' key
                if (ap[x].dashboard === state.targetDashboard) { //if returned data should be visable
                    const widgetRef: string = ap[x].widget
                    const security: string = ap[x].security
                    const data: object = ap[x].data
                    const widgetType = ap[x].widgetType
                    if (state.dataSet?.[widgetRef]?.[security] !== undefined) { //for target security from payload that is in target daashboard
                        const secObj: DataNode = state.dataSet[widgetRef][security]
                        if (widgetReducers[widgetType] !== undefined) { //IF Reducers need to be applied to finnHub API data for formatting or performance
                            let filteredDataFunc = widgetReducers[widgetType]
                            let filteredData = filteredDataFunc(data, secObj.filters)
                            filteredData.filters = secObj.filters
                            state.dataSet[widgetRef][security] = filteredData
                        } else { //no filters
                            state.dataSet[widgetRef][security] = ap[x].data
                        }
                    }
                }
            }
        },
        [tSearchMongoDB.pending.toString()]: (state, action) => {
            // console.log('1. Getting stock data!')
            // return {...state}
        },
        [tSearchMongoDB.rejected.toString()]: (state, action) => {
            console.log('2. failed to find data from Mongo: ', action)
            // return {...state}
        },
        [tSearchMongoDB.fulfilled.toString()]: (state, action) => {
            const ap: any = action.payload
            for (const x in ap) {
                if (ap[x] !== '') {
                    const widgetRef: string = ap[x].widget
                    const security: string = ap[x].security
                    const data: object = ap[x].data
                    const widgetType = ap[x].widgetType
                    if (state.dataSet?.[widgetRef]?.[security] !== undefined) { //for target security from payload that is in target daashboard
                        const secObj: DataNode = state.dataSet[widgetRef][security]
                        if (widgetReducers[widgetType] !== undefined) { //IF Reducers need to be applied to finnHub API data for formatting or performance
                            let filteredDataFunc = widgetReducers[widgetType]
                            let filteredData = filteredDataFunc(data, secObj.filters)
                            filteredData.filters = secObj.filters
                            state.dataSet[widgetRef][security] = filteredData
                        } else { //no filters
                            state.dataSet[widgetRef][security] = ap[x].data
                        }
                    }
                }
            }
        },
        [tGetSavedDashboards.fulfilled.toString()]: (state, action) => {
            const target = action.payload.currentDashBoard
            state.targetDashboard = target
        },
    }
})


export const {
    rTargetDashboardLogout,
    rBuildVisableData,
    rSetTargetDashboard,
    rUnmountWidget,
} = showData.actions
export default showData.reducer

