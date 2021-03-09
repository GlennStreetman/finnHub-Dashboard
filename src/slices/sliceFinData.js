import { createSlice } from '@reduxjs/toolkit';
import {widgetDict} from './../registers/endPointsReg.js'
import {tUpdateDashboardData} from './../thunks/thunkFetchFinnhub.js'

// DS = {
//     widgetID-Stock: {
//         xxxxdata: <---Move data to mongoDB
//         updated: 3 hours stale
//         apiString: MUST BE EQUAL
//     }
// }

const finnHubData = createSlice({
    name: 'finnHubData',
    initialState: {
        dataSet: {},
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
        // map endpoints to result list
        // const newState =  state.dataSet.withMutations((map)=>{
        //     //remove old datasets, create nodes for new datasets.
        //     map.keySeq().forEach((k) => {
        //         //if resList item exists in old list, delete from reslist, else delete from oldState
        //         resList.indexOf(k) > -1 ? 
        //             resList.splice(resList.indexOf(k), 1) :
        //             map.delete(k)
        //     })
            
            // for (const x of resList) { //Map remainnig resList items into state.
            //     map.set(x, null)
            // }
            

        // })
        // state.dataSet = newState

                        
        },
        rResetUpdateFlag: (state, action) => {
            state.created = true
            
        },
    },
        extraReducers: {
            [tUpdateDashboardData.pending]: (state, action) => {
                console.log('1. Getting stock data!')
                // return {...state}
            },
            [tUpdateDashboardData.rejected]: (state, action) => {
                console.log('2. failed to retrieve stock data for: ', action)
                // return {...state}
            },
            [tUpdateDashboardData.fulfilled]: (state, action) => {
                console.log("3 UPDATA DATA STORE:", action.payload)
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
        }
    
})

export const {
    rbuildFinndashDataset,
    rResetUpdateFlag,
} = finnHubData.actions
export default finnHubData.reducer
