import produce from "immer"

import { AppProps } from './../../App'
import { sliceDashboardData } from "src/slices/sliceDashboardData"
import { rSetTargetSecurity } from "src/slices/sliceTargetSecurity";
import { rSetDashboardData } from 'src/slices/sliceDashboardData'
import { rSetUpdateStatus, rRebuildTargetDashboardModel } from "src/slices/sliceDataModel";
import { tGetFinnhubData, tgetFinnHubDataReq } from "src/thunks/thunkFetchFinnhub";
import { tGetMongoDB } from "src/thunks/thunkGetMongoDB";
import { SaveDashboard } from 'src/appFunctions/appImport/setupDashboard'

export const syncGlobalStockList = async function (dispatch: Function, dashboardData: sliceDashboardData, currentDashboard: string, apiKey: string, finnHubQueue, appState, setAppState) {
    //sets current dashboards widgets security list to match global list. Drops data from mongo.
    const globalStockList = dashboardData[currentDashboard].globalstocklist
    const newFocus = globalStockList && Object.keys(globalStockList)[0] ? Object.keys(globalStockList)[0] : ''
    const updatedWidgetList: sliceDashboardData = await produce(dashboardData, (draftState: sliceDashboardData) => {
        const widgetList = draftState[currentDashboard].widgetlist
        for (const w in widgetList) {
            if (widgetList[w].widgetConfig === 'stockWidget') {
                widgetList[w]["trackedStocks"] = { ...globalStockList };
                widgetList[w].config.targetSecurity = newFocus
            }
        }
    })
    dispatch(rSetTargetSecurity(newFocus))
    dispatch(rSetDashboardData(updatedWidgetList))

    const payload = {
        apiKey: apiKey,
        dashboardData: dashboardData,
        targetDashboard: currentDashboard,
    }
    dispatch(rRebuildTargetDashboardModel(payload)) //rebuilds redux.Model
    console.log('refresh finnhub data for current dashboard', currentDashboard)

    await dispatch(tGetMongoDB({ dashboard: dashboardData[currentDashboard].id }))
    const payload2: tgetFinnHubDataReq = {
        dashboardID: dashboardData[currentDashboard].id,
        widgetList: Object.keys(dashboardData[currentDashboard].widgetlist),
        finnHubQueue: finnHubQueue,
        rSetUpdateStatus: rSetUpdateStatus,
    }
    dispatch(tGetFinnhubData(payload2))
    SaveDashboard(currentDashboard, appState, setAppState) //saves dashboard setup to server
}