import { createSlice } from '@reduxjs/toolkit';
import {widgetDict} from './../registers/endPointsReg.js'
import {tUpdateDashboardData} from './../thunks/thunkFetchFinnhub.js'
const _ = require('lodash')

// import ThrottleQueue from "./appFunctions/throttleQueue.js";

const finnHubData = createSlice({
    name: 'finnHubData',
    initialState: {
        dataSet: {},
        created: false

        // throttle: ThrottleQueue(25, 1000, true)
    }, 
    reducers: { //reducers can reference eachother with slice.caseReducers.reducer(state)
        rbuildFinndashDataset: (state, action) => { //{apiKey, currentDashboard, dashboardData, menuList}
            //receivies dashboard object and builds dataset from scratch.
            console.log("REBUILDING DATASET")
            const ap = action.payload
            const apD = ap.dashBoardData
            // console.log(apD)
            // const buildDataSet = {}
            for (const d in apD) { //for each dashboard
                const widgetList = apD[d].widgetlist
                for (const w in widgetList) { //for each widget
                    const widgetName = w
                    if (w !== null && w !== 'null') { 
                        const widget = widgetList[w].widgetType
                        const trackedStocks = {...widgetList[w].trackedStocks}
                        delete trackedStocks.sKeys
                        const filters = widgetList[w].filters
                        if (state.dataSet[widget]) {//if prev version already had widget
                            state.dataSet[widget][widgetName] = _.cloneDeep({...state[widget] , ...trackedStocks} )
                        } else {
                            state.dataSet[widget] = {}
                            state.dataSet[widget][widgetName] = _.cloneDeep({...trackedStocks})
                        }
                        
                        const endPointFunction = widgetDict[widget] //generates finnhub API strings
                        const endPointData = endPointFunction(trackedStocks, filters, ap.apiKey)
                        delete endPointData.undefined
                        for (const security in endPointData) {
                            const apiString = endPointData[security]
                            state.dataSet[widget][widgetName][security].apiString = apiString
                        }
                    }
                }
            }

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
                // console.log("3 UPDATA DATA STORE:", action)
                const ap = action.payload
                const endPoint = Object.keys(ap.dataSet)[0]
                const dataObj = ap.dataSet[Object.keys(ap.dataSet)[0]]
                const changeState = {...state.dataSet[endPoint], ...dataObj} 
                state.dataSet[endPoint] = changeState
            },
        }
    
})

export const {
    rbuildFinndashDataset,
} = finnHubData.actions
export default finnHubData.reducer
