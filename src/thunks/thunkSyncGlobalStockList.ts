import { createAsyncThunk } from '@reduxjs/toolkit';
import { dashBoardData, stock } from 'src/App'
import produce from "immer"

interface tUpdateWidgetFiltersReq {
    dashboardData: dashBoardData,
    targetSecurity: string,
}

export interface syncReturn {
    dashboardData: dashBoardData,
    targetSecurity: string,
    globalStockList: stock[],
    currentDashboard: string,
    apiKey: string,
}


export const tSyncGlobalStocklist = createAsyncThunk(
    'tSyncGlobalStocklist',
    async (req: tUpdateWidgetFiltersReq, thunkAPI: any) => {

        const currentDashboard = thunkAPI.getState().currentDashboard
        const apiKey = thunkAPI.getState().apiKey
        const globalStockList = Object.keys(req.dashboardData[currentDashboard].globalstocklist)

        const updateDashboard = await produce(req.dashboardData, (draftState: dashBoardData) => {
            const widgetList = draftState[currentDashboard].widgetlist
            Object.keys(widgetList).forEach(el => {
                widgetList[el].config.targetSecurity = req.targetSecurity
            })
        })

        console.log('updated d', updateDashboard)

        const returnItem = new Promise((res) => {
            res({
                dashboardData: updateDashboard,
                targetSecurity: req.targetSecurity,
                globalStockList: globalStockList,
                currentDashboard: currentDashboard,
                apiKey: apiKey,
            })
        })

        return returnItem
    })