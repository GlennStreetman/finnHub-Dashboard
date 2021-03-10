import { createSlice } from '@reduxjs/toolkit';
import {widgetDict} from '../registers/endPointsReg.js'
import {tUpdateDashboardData} from '../thunks/thunkFetchFinnhub.js'
import {tFinnHubDataMongo} from '../thunks/thunkCheckMongoDB.js'

const dataModel = createSlice({
    name: 'finnHubData',
    initialState: {
        dataSet: {},
        created: false    
    }, 
    reducers: { //reducers can reference eachother with slice.caseReducers.reducer(state)
        rBuildDataModel: (state, action) => { //{apiKey, currentDashboard, dashboardData, menuList}
            //receivies dashboard object and builds dataset from scratch.
            console.log("REBUILDING DATASET")
            const flag = state.created === false ?  true : 'updated'
            const ap = action.payload
            const apD = ap.dashBoardData
            const resList = []
            const endPointAPIList = {} //list of lists. Each list []
            //nested loops that create a list of endpoints for this dataset.
            for (const d in apD) { //for each dashboard
                const widgetList = apD[d].widgetlist 
                for (const w in widgetList) {  //for each widget
                    const widgetName = w  
                    if (w !== null && w !== 'null') { 
                        const endPoint = widgetList[w].widgetType
                        const filters = widgetList[w].filters
                        const endPointFunction = widgetDict[endPoint] //returns function that generates finnhub API strings
                        const trackedStocks = widgetList[w].trackedStocks
                        const endPointData = endPointFunction(trackedStocks, filters, ap.apiKey)
                        delete endPointData.undefined
                        endPointAPIList[widgetName] = endPointData
                        for (const s in trackedStocks) {
                            if (trackedStocks[s].key !== undefined) {
                                const key = trackedStocks[s].key
                                const dataName = `${widgetName}-${key}`
                                resList.push(dataName)
                            }
                        }
                    }
                }
            }
        
            for (const x in state.dataSet) {
                //if resList item exists in old list, delete from reslist, else delete from oldState
                resList.indexOf(x) > -1 ? 
                    resList.splice(resList.indexOf(x), 1) :
                    delete state.dataSet[x]
            }
            for (const x of resList) { //Map remainnig resList items into state.
                state.dataSet[x] = null
            }

            for (const widget in endPointAPIList) {
                const thisWidget = endPointAPIList[widget]
                for (const security in thisWidget) {
                    state.dataSet[`${widget}-${security}`] = {apiString: thisWidget[security]}
                }
            }
            state.created = flag                       
        },
        rResetUpdateFlag: (state, action) => {
            state.created = true
            
        },
    },
    extraReducers: {
        [tUpdateDashboardData.pending]: (state, action) => {
            // console.log('1. Getting stock data!')
            // return {...state}
        },
        [tUpdateDashboardData.rejected]: (state, action) => {
            console.log('2. failed to retrieve stock data for: ', action)
            // return {...state}
        },
        [tUpdateDashboardData.fulfilled]: (state, action) => {
            // console.log("3 UPDATA DATA STORE:", action.payload)
            const ap = action.payload
                for (const x in ap) {
                    const updateObj = {
                        apiString: ap[x].apiString,
                        updated: ap[x].updated,
                        data: ap[x].data,
                    }
                    state.dataSet[x] =  updateObj
                }
        },
        [tFinnHubDataMongo.pending]: (state, action) => {
            // console.log('1. Getting stock data!')
            // return {...state}
        },
        [tFinnHubDataMongo.rejected]: (state, action) => {
            console.log('2. failed showData from Mongo: ', action)
            // return {...state}
        },
        [tFinnHubDataMongo.fulfilled]: (state, action) => {
            console.log("Merge update fields into dataSet from mongoDB")
            const ap = action.payload
            for (const x in ap) {
                const apiString = ap[x].key
                const updated = ap[x].updated
                if (state.dataSet[apiString] !== undefined) {
                    state.dataSet[apiString].updated = updated
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
