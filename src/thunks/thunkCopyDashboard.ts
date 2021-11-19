import { createAsyncThunk } from '@reduxjs/toolkit';
import { dashBoardData, menuList, widgetList } from 'src/App'
import produce from 'immer'
import { uniqueObjectnName } from 'src/appFunctions/stringFunctions'
//receives list of strings to search for. WidgetKey-targetSecurity
//pushes returned string to visableData in redux.

export interface tCopyDashboardReq {
    copyName: string,
    dashboardData: dashBoardData,
    menuList: menuList,
}

export const tCopyDashboard = createAsyncThunk(
    'tCopyDashboard',
    (req: tCopyDashboardReq, thunkAPI: any) => {
        const { copyName, dashboardData, menuList } = req
        const widgList: widgetList = dashboardData[copyName].widgetlist
        const newWidgetList: widgetList = produce(widgList, (draftState: widgetList) => {
            console.log('saving dashboard copy', widgList)
            const stamp = new Date().getTime()
            const keys = Object.keys(widgList)
            for (const k in keys) {
                draftState[stamp + k] = draftState[keys[k]]
                draftState[stamp + k]['widgetID'] = stamp + k
                draftState[stamp + k].trackedStocks = {}
                delete draftState[keys[k]]
            }
            // return draftState
        })
        const uniqueName = uniqueObjectnName(copyName, dashboardData)
        let serverUpdate = new Promise(async (res) => {
            const data = {
                dashBoardName: uniqueName,
                globalStockList: {},
                widgetList: newWidgetList,
                menuList: menuList,
            };
            const options = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            };
            await fetch("/dashBoard", options) //posts that data to be saved.
            fetch('/dashboard') //retrieve updated dashboardList.
                .then(res => res.json())
                .then((data) => {
                    res(data)
                })
                .catch((err) => {
                    console.log("dashboard save error: ", err)
                    res(false)
                })
        })
        return serverUpdate
    })
