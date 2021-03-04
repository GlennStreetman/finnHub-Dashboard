import { createSlice } from '@reduxjs/toolkit';
import {widgetDict} from './../registers/endPointsReg.js'
import {tUpdateDashboardData} from './../thunks/thunkFetchFinnhub.js'
// const _ = require('lodash')
const { Map } = require('immutable')

// DS = {
//     widgetID-Stock: {
//         data: 
//         updated: 3 hours stale
//         apiString: MUST BE EQUAL
//     }
// }

const finnHubData = createSlice({
    name: 'finnHubData',
    initialState: {
        dataSet: Map(),
        created: false    
    }, 
    reducers: { //reducers can reference eachother with slice.caseReducers.reducer(state)
        rbuildFinndashDataset: (state, action) => { //{apiKey, currentDashboard, dashboardData, menuList}
            //receivies dashboard object and builds dataset from scratch.
            console.log("REBUILDING DATASET")
            const flag = state.created === false ?  true : 'updated'
            const ap = action.payload
            const apD = ap.dashBoardData
            const resList = []
            for (const d in apD) { //for each dashboard
                const widgetList = apD[d].widgetlist 
                for (const w in widgetList) { //for each widget
                    const widgetName = w 
                    if (w !== null && w !== 'null') { 
                        const endPoint = widgetList[w].widgetType
                        const filters = widgetList[w].filters
                        const endPointFunction = widgetDict[endPoint] //generates finnhub API strings
                        const trackedStocks = widgetList[w].trackedStocks
                        const endPointData = endPointFunction(trackedStocks, filters, ap.apiKey)
                        delete endPointData.undefined

                        
                        for (const s in trackedStocks) {
                            if (trackedStocks[s].key !== undefined) {
                                const dataName = `${widgetName}-${trackedStocks[s].key}`
                                resList.push(dataName)
                            }
                        }
                        // const thisMap = Map({test: 'test1', test2: "test2"})
                        const newState =  state.dataSet.withMutations((map)=>{
                            //remove old datasets, create nodes for new datasets.
                            map.keySeq().forEach((k) => {
                                resList.indexOf(k) > -1 ? 
                                    resList.splice(resList.indexOf(k), 1) :
                                    map.delete(k)
                            })
                            
                            for (const x of resList) {
                                map.set(x, null)
                            }
                            
                            for (const security in endPointData) {
                                map.set(`${widgetName}-${security}`, {apiString: endPointData[security]})
                            }
                        })
                        state.dataSet = newState
                        state.created = flag
                        
                        // state.created === false ? state.created = true : state.created = 'updated' 

                    }
                }
            }
        },
        rResetUpdateFlag: (state, action) => {
            console.log("UPDATE FLAG------------")
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
                const newState = state.dataSet.withMutations((map)=>{
                    console.log("HERE!", state.dataSet)
                    for (const x in ap) {
                        const updateObj = {
                            apiString: ap[x].apiString,
                            updated: ap[x].updated,
                            data: ap[x].data,
                        }
                        map.set(x, updateObj) 
                    }
                    
                })
                state.dataSet = newState
            },
        }
    
})

export const {
    rbuildFinndashDataset,
    rResetUpdateFlag,
} = finnHubData.actions
export default finnHubData.reducer
