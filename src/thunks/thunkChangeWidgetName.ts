import { createAsyncThunk } from '@reduxjs/toolkit';
import produce from "immer"
import { throttleResObj as queResObj } from "../appFunctions/appImport/throttleQueueAPI";
// import { sliceMenuList } from './../slices/sliceMenuList'
// import { sliceDashboardData } from './../slices/sliceDashboardData'
// import { widgetList } from './../slices/sliceDashboardData'

//Receives list of widgets and checks stale dates in slice/datamodel to see if updates are needed.
//If data is not fresh dispatch finnHub api request to throttleQueue.
//Returns finnhub data to mongoDB AND updates slice/ShowData.
export interface tChangeWidgetNameReq {
    stateRef: 'widgetList' | 'menuList',
    widgetID: string | number,
    newName: string
}

export interface resObj {
    [key: string]: queResObj
}

function uniqueName(widgetName: string, nameList: string[], iterator = 0) {
    const testName = iterator === 0 ? widgetName : widgetName + iterator
    if (nameList.includes(testName)) {
        return uniqueName(widgetName, nameList, iterator + 1)
    } else {
        return testName
    }
}

export const tChangeWidgetName = createAsyncThunk( //{endPoint, [securityList]}
    'tChangeWidgetName',
    (req: tChangeWidgetNameReq, thunkAPI: any) => { //{dashboard: string, widgetList: []} //receives list of widgets from a dashboard to update.

        const resObj: any = {}

        const currentDashboard = thunkAPI.getState().currentDashboard
        const dashboardData = thunkAPI.getState().dashboardData
        const menuList = thunkAPI.getState().menuList

        const widgetList = dashboardData[currentDashboard].widgetlist
        const widgetIds = widgetList ? Object.keys(widgetList) : []
        const widgetNameList = widgetIds.map((el) => widgetList[el].widgetHeader)
        // console.log(stateRef, newName, widgetNameList)
        const useName = uniqueName(req.newName, widgetNameList)
        if (req.stateRef === 'menuList') {
            const newWidgetList = produce(menuList, (draftState) => {
                draftState[req.widgetID].widgetHeader = useName
            })
            resObj.rSetMenuList = newWidgetList
            // dispatch(rSetMenuList(newWidgetList)) //update menulist
        } else { //widgetList
            const widgetGroup = dashboardData[currentDashboard].widgetlist
            const newWidgetList = produce(widgetGroup, (draftState) => {
                draftState[req.widgetID].widgetHeader = useName
            })
            const newDashboardData = produce(dashboardData, (draftState) => {
                draftState[currentDashboard].widgetlist = newWidgetList
            })
            resObj.rSetDashboardData(newDashboardData)
        }

        return resObj
    })