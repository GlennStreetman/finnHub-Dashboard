import { createSlice } from '@reduxjs/toolkit';
import {widgetDict} from './../registers/endPointsReg.js'
import {tUpdateDashboardData} from './../thunks/thunkFetchFinnhub.js'


// import ThrottleQueue from "./appFunctions/throttleQueue.js";

const finnHubData = createSlice({
    name: 'finnHubData',
    initialState: {
        dataSet: {},
        created: false

        // throttle: ThrottleQueue(25, 1000, true)
    }, 
    reducers: { //reducers can reference eachother with slice.caseReducers.reducer(state)
        rbuildFinndashDataset: (state, action) => { //{LIST OF DAHSBOARDS}
            //receivies dashboard object and builds dataset from scratch.
            const ap = action.payload
            const apD = ap.dashBoardData
            // console.log('apD: ', apD)
            const buildDataSet = {}
            //find all endpoints
            for (const d in apD) { //dashboard
                // console.log("APD[d] - ", apD[d], d)
                const widgetList = apD[d].widgetlist
                for (const w in widgetList) { //widget
                    const widget = widgetList[w].widgetType
                    
                    const trackedStocks = {...widgetList[w].trackedStocks}
                    delete trackedStocks.sKeys
                    const filters = widgetList[w].filters
                    buildDataSet[widget] ? 
                        buildDataSet[widget] = {...trackedStocks} :
                        buildDataSet[widget] = {...buildDataSet[widget] , ...trackedStocks}  
                    
                    //generate finnhub API strings
                    const endPointFunction = widgetDict[widget]
                    
                    const endPointData = endPointFunction(trackedStocks, filters, ap.apiKey)
                    // console.log("-----",endPointData)
                    delete endPointData.undefined
                    for (const security in endPointData) {
                        // console.log("buildDataSet: ", buildDataSet ,' - ' 
                        // ,buildDataSet[widget] ,' - ' 
                        // ,buildDataSet[widget][security], ' - ' 
                        // ,endPointData)
                        buildDataSet[widget][security].apiString = endPointData[security]
                    }
                }
            }
            const s = state
            const update = {
                dataSet: buildDataSet,
                created: true,
            }
            return ({...s, ...update}) 
        },
    },
        extraReducers: {
            [tUpdateDashboardData.pending]: (state, action) => {
                console.log('1. Getting stock data!')
                return {...state}
            },
            [tUpdateDashboardData.rejected]: (state, action) => {
                console.log('2. failed to retrieve stock data for: ', action)
                return {...state}
            },
            [tUpdateDashboardData.fulfilled]: (state, action) => {
                console.log("3 UPDATA DATA STORE:", action)
                const ap = action.payload
                const endPoint = Object.keys(ap.dataSet)[0]
                const dataObj = ap.dataSet[Object.keys(ap.dataSet)[0]]
                const changeState = {...state.dataSet[endPoint], ...dataObj} 
                // const newStateObj = {...changeState, ...dataObj}
                console.log("DONE", changeState)
                state.dataSet[endPoint] = changeState
                console.log(state.dataSet[endPoint])
                // return({...state})
            },
        }
    
})

export const {
    rbuildFinndashDataset,
} = finnHubData.actions
export default finnHubData.reducer
