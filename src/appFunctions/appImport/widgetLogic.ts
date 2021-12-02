import produce from "immer"
import { reqBody } from '../../server/routes/mongoDB/setMongoConfig'
import { menuList, filters, config, dashBoardData } from 'src/App'
import { rRebuildTargetWidgetModel } from 'src/slices/sliceDataModel'
import { tGetFinnhubData } from 'src/thunks/thunkFetchFinnhub'
import { rSetUpdateStatus } from 'src/slices/sliceDataModel'
import { finnHubQueue } from "src/appFunctions/appImport/throttleQueueAPI";
import { rSetWidgetFilters, rSetWidgetConfig } from 'src/slices/sliceDashboardData'
import { tSaveDashboard } from 'src/thunks/thunkSaveDashboard'


//widget filters change how data is queried from finnHub
export const UpdateWidgetFilters = async function (
    widgetID: string | number,
    data: filters,
    dashBoardData: dashBoardData,
    currentDashboard: string,
    dispatch: Function,
    apiKey: string,
    finnHubQueue: finnHubQueue,
) {
    try {
        dispatch(rSetWidgetFilters({
            newFilters: data,
            currentDashboard: currentDashboard,
            widgetID: widgetID,
        }))
        fetch(`/deleteFinnDashData?widgetID=${widgetID}`)
        dispatch(rRebuildTargetWidgetModel({ //rebuild data model (removes stale dates)
            apiKey: apiKey,
            dashBoardData: dashBoardData,
            targetDashboard: currentDashboard,
            targetWidget: widgetID,
        }))
        //remove visable data?
        dispatch(tGetFinnhubData({//fetch fresh data
            dashboardID: dashBoardData[currentDashboard].id,
            targetDashBoard: currentDashboard,
            widgetList: [widgetID],
            finnHubQueue: finnHubQueue,
            rSetUpdateStatus: rSetUpdateStatus,
            dispatch: dispatch,
        }))
        dispatch(tSaveDashboard({ dashboardName: currentDashboard }))
    } catch { console.log("Problem updating widget filters."); return false }

}

//widget config changes how data is manipulated after being queried.
export const updateWidgetConfig = async function (
    widgetID: string | number,
    updateObj: config,
    dashBoardData: dashBoardData,
    currentDashboard: string,
    enableDrag: boolean,
    dispatch: Function) { //replaces widget config object then saves changes to mongoDB & postgres.

    dispatch(rSetWidgetConfig({
        newConfig: updateObj,
        currentDashboard: currentDashboard,
        widgetID: widgetID,
    }))

    if (enableDrag !== true) {
        const updatedDashboardData: dashBoardData = produce(dashBoardData, (draftState: dashBoardData) => {
            const oldConfig = draftState[currentDashboard].widgetlist[widgetID].config
            draftState[currentDashboard].widgetlist[widgetID].config = { ...oldConfig, ...updateObj }
        })
        dispatch(tSaveDashboard({ dashboardName: currentDashboard }))
        const updatedWidgetFilters = updatedDashboardData[currentDashboard].widgetlist[widgetID].config
        const postBody: reqBody = {
            widget: widgetID,
            config: updatedWidgetFilters,
        }
        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(postBody),
        };

        fetch("/updateGQLConfig", options)
    }
}

export const toggleWidgetBody = function (widgetID: string | number, stateRef: 'menuWidget' | 'stockWidget' | 'marketWidget', dashBoardData: dashBoardData, menuList: menuList, currentDashboard: string) {
    if (stateRef === 'stockWidget') {
        const updatedWidget: dashBoardData = produce(dashBoardData, (draftState: dashBoardData) => {
            draftState[currentDashboard].widgetlist[widgetID].showBody = !draftState[currentDashboard].widgetlist[widgetID].showBody
        })
        return (updatedWidget)
    } else {
        const updatedWidget: menuList = produce(menuList, (draftState: menuList) => {
            draftState[widgetID].showBody = draftState[widgetID].showBody !== undefined ? !draftState[widgetID].showBody : false
        })
        return (updatedWidget)
    }

}