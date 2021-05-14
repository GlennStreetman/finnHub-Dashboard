import { createSlice } from '@reduxjs/toolkit';
import { widgetDict } from '../registers/endPointsReg'
import { tGetFinnhubData, resObj } from '../thunks/thunkFetchFinnhub'
import { tGetMongoDB, getMongoRes } from '../thunks/thunkGetMongoDB'
import { dashBoardData } from './../App'

interface dataStatus {
    [key: string]: string, //dashboard data setup status: setup in progress, updating, ready
}

interface DataNode {
    apiString?: string,
    updated?: number | string,
    widgetName?: string,
    widgetType?: string,
    dashboard?: string,
    stale?: number,
}

interface securityList {
    [key: string]: DataNode
}

interface widgetList {
    [key: string]: securityList
}

interface dashboardList {
    [key: string]: widgetList
}


export interface sliceDataModel {
    dataSet: dashboardList,
    status: dataStatus,
    created: string,
}

export interface setUpdateStatus {
    [key: string]: string
}

export interface EndPointObj {
    [key: string]: any
}

interface EndPointAPIList {
    [key: string]: EndPointObj
}

export interface rBuildDataModelPayload {
    apiKey: string,
    dashBoardData: dashBoardData
}

const initialState: sliceDataModel = {
    dataSet: {},
    status: {},
    created: 'false',
}

const dataModel = createSlice({
    name: 'finnHubData',
    initialState,
    reducers: {
        rBuildDataModel: (state: sliceDataModel, action) => { //{apiKey, dashboardData}
            //receivies dashboard object and builds dataset from scratch.
            const ap: rBuildDataModelPayload = action.payload
            const apD: dashBoardData = ap.dashBoardData
            const endPointAPIList: EndPointAPIList = {} //list of lists. Each list []
            for (const d in apD) { //for each dashboard
                const dashboardName: string = d
                state.status[dashboardName] = 'Setup in Progress'
                endPointAPIList[dashboardName] = {}
                const widgetList = apD[d].widgetlist
                for (const w in widgetList) {  //for each widget
                    const widgetName: string = w
                    if (w !== null && w !== 'null') {
                        const endPoint: string = widgetList[w].widgetType
                        const filters: Object = widgetList[w].filters
                        const widgetDescription: string = widgetList[w].widgetHeader
                        const widgetType: string = widgetList[w].widgetType
                        const config: Object = widgetList[w].config
                        const endPointFunction: Function = widgetDict[endPoint] //returns function that generates finnhub API strings
                        const trackedStocks = widgetList[w].trackedStocks
                        const endPointData: EndPointObj = endPointFunction(trackedStocks, filters, ap.apiKey)
                        delete endPointData.undefined
                        endPointAPIList[dashboardName][widgetName] = {}
                        for (const stock in endPointData) {
                            endPointAPIList[dashboardName][widgetName][`${stock}`] = {
                                apiString: endPointData[stock],
                                widgetName: widgetDescription,
                                dashboard: dashboardName,
                                widgetType: widgetType,
                                config: config,
                            }
                        }
                    }
                }
            }
            state.dataSet = endPointAPIList
            const flag: boolean | string = state.created === 'false' ? 'true' : 'updated'
            state.created = flag

        },
        rResetUpdateFlag: (state: sliceDataModel) => {
            state.created = 'true'

        },
        rSetUpdateStatus: (state: sliceDataModel, action) => {
            //set the status of dashboard updates.
            const ap: setUpdateStatus = action.payload
            for (const dataSet in ap) {
                state.status[dataSet] = ap[dataSet]
            }
        },
    },
    extraReducers: {
        [tGetFinnhubData.pending.toString()]: (state, action) => {
        },
        [tGetFinnhubData.rejected.toString()]: (state, action) => {
            console.log('2. failed to retrieve stock data for: ', action)
        },
        [tGetFinnhubData.fulfilled.toString()]: (state: sliceDataModel, action) => {
            const ap: resObj = action.payload
            for (const x in ap) {
                const db = ap[x].dashboard
                const widget = ap[x].widget
                const sec = ap[x].security
                if (state.dataSet?.[db]?.[widget]?.[sec]) {
                    state.dataSet[db][widget][sec]['apiString'] = ap[x].apiString
                    state.dataSet[db][widget][sec]['updated'] = ap[x].updated
                }
            }
        },
        [tGetMongoDB.pending.toString()]: (state, action) => {
        },
        [tGetMongoDB.rejected.toString()]: (state, action) => {
            console.log('2. failed showData from Mongo: ', action)
        },

        [tGetMongoDB.fulfilled.toString()]: (state: sliceDataModel, action) => {
            //set updated and stale flags.
            const ap: getMongoRes = action.payload
            for (const x in ap) {
                const dashboard = ap[x].dashboard
                const widget = ap[x].widget
                const updated = ap[x].updated
                const stale = ap[x].stale
                const security = ap[x].security
                if (state.dataSet?.[dashboard]?.[widget]?.[security]) {
                    state.dataSet[dashboard][widget][security].updated = updated
                    state.dataSet[dashboard][widget][security].stale = stale
                }
            }
        },
    }
})

export const {
    rBuildDataModel,
    rResetUpdateFlag,
    rSetUpdateStatus,
} = dataModel.actions
export default dataModel.reducer
