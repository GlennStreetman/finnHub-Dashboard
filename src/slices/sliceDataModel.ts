import { createSlice } from '@reduxjs/toolkit';
import { widgetDict } from '../registers/endPointsReg'
import { tGetFinnhubData, resObj } from '../thunks/thunkFetchFinnhub'
import { tGetMongoDB, getMongoRes } from '../thunks/thunkGetMongoDB'
import { dashBoardData } from './../App'
import { tSearchMongoDB } from '../thunks/thunkSearchMongoDB'
import { tGetSavedDashboards } from '../thunks/thunkGetSavedDashboards'
import { tAddNewWidgetContainer } from 'src/thunks/thunkAddNewWidgetContainer'

interface dataStatus {
    [key: number]: number, //dashboard data setup status: count of open api requests.
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

export interface rebuildTargetWidgetPayload {
    apiKey: string,
    dashBoardData: dashBoardData,
    targetDashboard: string,
    targetWidget: string,
}

export interface rRebuildTargetDashboardPayload {
    apiKey: string,
    dashBoardData: dashBoardData,
    targetDashboard: string,

}

export interface rRemoveDashboardPayload {
    dashboardName: string,
}

export interface rAddDashboardPayload {
    dashboardName: string,
}

export interface rRemoveWidgetDataModelPayload {
    dashboardName: string,
    widgetKey: string,
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
            // console.log('building data model')
            //receivies dashboard object and builds dataset from scratch.
            const ap: rBuildDataModelPayload = action.payload
            const apD: dashBoardData = ap.dashBoardData
            const dataModel: EndPointAPIList = {} //list of lists. Each list []
            for (const d in apD) { //for each dashboard
                const dashboardName: string = d
                state.status[dashboardName] = 0
                dataModel[dashboardName] = {}
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
                        dataModel[dashboardName][widgetName] = {}
                        for (const stock in endPointData) {
                            dataModel[dashboardName][widgetName][`${stock}`] = {
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
            state.dataSet = dataModel
            const flag: boolean | string = state.created === 'false' ? 'true' : 'updated'
            state.created = flag
        },
        rRebuildTargetDashboardModel: (state: sliceDataModel, action) => {
            const ap: rRebuildTargetDashboardPayload = action.payload
            const dashboardName: string = ap.targetDashboard
            const targetDashboard = ap.dashBoardData

            const newDashboardModel = {}
            const widgetList = targetDashboard.widgetlist
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
                    newDashboardModel[widgetName] = {}
                    for (const stock in endPointData) {
                        newDashboardModel[widgetName][`${stock}`] = {
                            apiString: endPointData[stock],
                            widgetName: widgetDescription,
                            dashboard: dashboardName,
                            widgetType: widgetType,
                            config: config,
                        }
                    }
                }
            }
            state.dataSet[dashboardName] = newDashboardModel
        },
        rRebuildTargetWidgetModel: (state: sliceDataModel, action) => {
            const ap: rebuildTargetWidgetPayload = action.payload
            const apD: dashBoardData = ap.dashBoardData
            const dashboardName: string = ap.targetDashboard
            const w: string = ap.targetWidget //widget name

            const targetWidget = apD?.[dashboardName].widgetlist[w]
            const stockUpdate = {}
            if (w !== null && w !== 'null') {
                const endPoint: string = targetWidget.widgetType
                const filters: Object = targetWidget.filters
                const widgetDescription: string = targetWidget.widgetHeader
                const widgetType: string = targetWidget.widgetType
                const config: Object = targetWidget.config
                const endPointFunction: Function = widgetDict[endPoint] //returns function that generates finnhub API strings
                const trackedStocks = targetWidget.trackedStocks
                const endPointData: EndPointObj = endPointFunction(trackedStocks, filters, ap.apiKey)
                delete endPointData.undefined

                for (const stock in endPointData) {
                    stockUpdate[`${stock}`] = {
                        apiString: endPointData[stock],
                        widgetName: widgetDescription,
                        dashboard: dashboardName,
                        widgetType: widgetType,
                        config: config,
                    }
                }
            }
            state.dataSet[dashboardName][w] = stockUpdate

        },
        rResetUpdateFlag: (state: sliceDataModel) => {
            state.created = 'true'
        },
        rSetUpdateStatus: (state: sliceDataModel, action) => {
            //set the status of dashboard updates.
            const ap: setUpdateStatus = action.payload
            for (const dataSet in ap) {
                state.status[dataSet] = state.status[dataSet] + ap[dataSet]
            }
        },
        rDataModelLogout(state: sliceDataModel) {
            console.log('reseting state')
            state.dataSet = {}
            state.status = {}
            state.created = 'false'
        },
        rRemoveDashboardDataModel(state: sliceDataModel, action) {
            const ap: rRemoveDashboardPayload = action.payload
            const removeDashboard = ap.dashboardName
            delete state.dataSet[removeDashboard]
        },
        rRemoveWidgetDataModel(state: sliceDataModel, action) {
            const ap: rRemoveWidgetDataModelPayload = action.payload
            const targetDashboard = ap.dashboardName
            const targetWidget = ap.widgetKey
            delete state.dataSet?.[targetDashboard]?.[targetWidget]
        },
        rAddNewDashboard(state: sliceDataModel, action) {
            const ap: rAddDashboardPayload = action.payload
            const targetDashboard = ap.dashboardName
            state.dataSet[targetDashboard] = {}
        },
        rRenameModelName(state: sliceDataModel, action) {
            const ap = action.payload
            const dataSet = state.dataSet
            dataSet[ap.newName] = dataSet[ap.oldName]
            delete dataSet[ap.oldName]
        }
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
        [tSearchMongoDB.pending.toString()]: (state, action) => {
            // console.log('1. Getting stock data!')
            // return {...state}
        },
        [tSearchMongoDB.rejected.toString()]: (state, action) => {
            console.log('2. failed to find data from Mongo: ', action)
            // return {...state}
        },
        [tSearchMongoDB.fulfilled.toString()]: (state, action) => {
            // console.log('tSearchMongoDB', action.payload)
            const ap: any = action.payload
            for (const x in ap) {
                if (ap[x] === '') {
                    const searchList = x.split('-')
                    const dashboard = searchList[0]
                    const widget = searchList[1]
                    const security = `${searchList[2]}-${searchList[3]}`
                    if (state.dataSet?.[dashboard]?.[widget]?.[security]) state.dataSet[dashboard][widget][security].stale = -1
                    if (state.dataSet?.[dashboard]?.[widget]?.[security]) state.dataSet[dashboard][widget][security].updated = -1
                }
            }
        },
        [tGetSavedDashboards.fulfilled.toString()]: (state, action) => {
            const ap: rBuildDataModelPayload = action.payload
            const apD: dashBoardData = ap.dashBoardData
            const dataModel: EndPointAPIList = {} //list of lists. Each list []
            for (const d in apD) { //for each dashboard
                const dashboardName: string = d
                state.status[dashboardName] = 0
                dataModel[dashboardName] = {}
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
                        dataModel[dashboardName][widgetName] = {}
                        for (const stock in endPointData) {
                            dataModel[dashboardName][widgetName][`${stock}`] = {
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
            state.dataSet = dataModel
            const flag: boolean | string = state.created === 'false' ? 'true' : 'updated'
            state.created = flag
        },
        [tAddNewWidgetContainer.fulfilled.toString()]: (state, action) => {
            const newWidget = action.payload.newWidget
            const targetDashboard = action.payload.currentDashboard
            const widgetName = newWidget.widgetID
            const apiKey = action.payload.apiKey

            const dataModel = {}

            const endPoint: string = newWidget.widgetType
            const filters: Object = newWidget.filters
            const widgetDescription: string = newWidget.widgetHeader
            const widgetType: string = newWidget.widgetType
            const config: Object = newWidget.config
            const endPointFunction: Function = widgetDict[endPoint] //returns function that generates finnhub API strings
            const trackedStocks = newWidget.trackedStocks
            const endPointData: EndPointObj = endPointFunction(trackedStocks, filters, apiKey)
            delete endPointData.undefined

            for (const stock in endPointData) {
                dataModel[`${stock}`] = {
                    apiString: endPointData[stock],
                    widgetName: widgetDescription,
                    dashboard: targetDashboard,
                    widgetType: widgetType,
                    config: config,
                }
            }

            state.dataSet[targetDashboard][widgetName] = dataModel

            return state
        }
    }
})

export const {
    rBuildDataModel,
    rResetUpdateFlag,
    rSetUpdateStatus,
    rDataModelLogout,
    rRemoveDashboardDataModel,
    rRemoveWidgetDataModel,
    rRebuildTargetDashboardModel,
    rRebuildTargetWidgetModel,
    rAddNewDashboard,
    rRenameModelName,
} = dataModel.actions
export default dataModel.reducer
