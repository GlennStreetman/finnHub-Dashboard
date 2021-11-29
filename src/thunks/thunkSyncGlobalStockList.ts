import { createAsyncThunk } from '@reduxjs/toolkit';
import { dashBoardData } from 'src/App'

interface tUpdateWidgetFiltersReq {
    dashboardData: any,
    targetSecurity: any,
}

export const tSyncGlobalStocklist = createAsyncThunk(
    'tSyncGlobalStocklist',
    async (req: tUpdateWidgetFiltersReq, thunkAPI: any) => {

        const currentDashboard = thunkAPI.getState().currentDashboard
        const globalStockList = Object.keys(req.dashboardData[currentDashboard].globalstocklist)

        console.log('currentDashboard', currentDashboard, 'globalStockList', globalStockList, 'dashboardData', req.dashboardData, 'targetSecurity', req.targetSecurity)

        return {
            dashboardData: req.dashboardData,
            targetSecurity: req.targetSecurity,
            globalStockList: globalStockList
        }
    })