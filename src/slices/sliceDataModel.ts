import { createSlice } from '@reduxjs/toolkit';
import { widgetDict } from '../registers/endPointsReg'
import { tGetFinnhubData, resObj } from '../thunks/thunkFetchFinnhub'
import { tGetMongoDB } from '../thunks/thunkGetMongoDB'


interface DataNode {
    apiString?: string,
    updated?: number,
    description?: string,
    dashboard?: string,
    stale?: number,
}

interface DataSet {
    dataSet: { [key: string]: DataNode, },
    status: { [key: string]: string, } //Updating, Ready
    created: string
}

export interface EndPointObj {
    [key: string]: any
}

interface EndPointAPIList {
    [key: string]: EndPointObj
}

const initialState: DataSet = {
    dataSet: {},
    status: {},
    created: 'false',
}

const dataModel = createSlice({
    name: 'finnHubData',
    initialState,
    reducers: {
        rBuildDataModel: (state, action) => { //{apiKey, dashboardData}
            //receivies dashboard object and builds dataset from scratch.
            const ap: any = action.payload
            const apD: any = ap.dashBoardData
            // console.log("Building DATASET")
            const endPointAPIList: EndPointAPIList = {} //list of lists. Each list []
            //create dataSet
            for (const d in apD) { //for each dashboard
                const dashboardName: string = d
                state.status[dashboardName] = 'Ready'
                endPointAPIList[dashboardName] = {}
                const widgetList = apD[d].widgetlist
                for (const w in widgetList) {  //for each widget
                    const widgetName: string = w
                    if (w !== null && w !== 'null') {
                        const endPoint: string = widgetList[w].widgetType
                        const filters: Object = widgetList[w].filters
                        const widgetDescription: string = widgetList[w].widgetHeader
                        // @ts-ignore: Unreachable code error
                        const endPointFunction: Function = widgetDict[endPoint] //returns function that generates finnhub API strings
                        const trackedStocks = widgetList[w].trackedStocks
                        const endPointData: EndPointObj = endPointFunction(trackedStocks, filters, ap.apiKey)
                        delete endPointData.undefined
                        endPointAPIList[dashboardName][widgetName] = {}
                        for (const stock in endPointData) {
                            endPointAPIList[dashboardName][widgetName][`${stock}`] = {
                                apiString: endPointData[stock],
                                description: widgetDescription,
                                dashboard: dashboardName,
                            }
                        }
                    }
                }
            }

            //check for stale date and retain info?????
            state.dataSet = endPointAPIList
            const flag: boolean | string = state.created === 'false' ? 'true' : 'updated'
            // console.log("UPDATING FLAG", flag)
            state.created = flag

        },
        rResetUpdateFlag: (state) => {
            // console.log("reseting update flag")
            state.created = 'true'

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
            console.log('2. failed to retrieve stock data for: ', action)
            // return {...state}
        },
        // @ts-ignore: Unreachable code error
        [tGetFinnhubData.fulfilled]: (state, action) => {
            // console.log("3 UPDATA DATA STORE:", action.payload)
            const ap: resObj = action.payload
            for (const x in ap) {
                const db = ap[x].dashboard
                state.status[db] = 'Ready'
                const widget = ap[x].widget
                const sec = ap[x].security
                // if (state.dataSet[db] && state.dataSet[db][widget] && state.dataSet[db][widget][sec]) {
                if (state.dataSet?.[db]?.[widget]?.[sec]) {
                    state.dataSet[db][widget][sec]['apiString'] = ap[x].apiString
                    state.dataSet[db][widget][sec]['updated'] = ap[x].updated
                }
            }
        },
        // @ts-ignore: Unreachable code error
        [tGetMongoDB.pending]: (state, action) => {
            console.log('1. Getting stock data!')
            // const dashboard: string = action.meta.arg.targetDashBoard
            // state.status[dashboard] = 'Updating'
        },
        // @ts-ignore: Unreachable code error
        [tGetMongoDB.rejected]: (state, action) => {
            console.log('2. failed showData from Mongo: ', action)
            // return {...state}
        },
        // @ts-ignore: Unreachable code error
        [tGetMongoDB.fulfilled]: (state, action) => {
            // console.log("3Merge update fields into dataSet from mongoDB", action)
            const ap = action.payload
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
} = dataModel.actions
export default dataModel.reducer
