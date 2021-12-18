import { createAsyncThunk } from '@reduxjs/toolkit';
// import { filters } from 'src/slices/sliceDashboardData'
import { stock, widget } from 'src/App'
// import {widget} from 


export interface tAddStockReq {
    widgetId: string | number,
    symbol: string,
    currentDashboard: string,
    stockObj: stock
}

export interface tAddStockRes {
    widgetId: string | number,
    symbol: string,
    currentDashboard: string,
    stockObj: stock,
    apiKey: string,
    widgetObj: widget
}

export const tAddStock = createAsyncThunk(
    'tAddstock',
    async (req: tAddStockReq, thunkAPI: any) => {

        const apiKey = thunkAPI.getState().apiKey
        const widgetObj = thunkAPI.getState().dashboardData[req.currentDashboard].widgetlist[req.widgetId]

        return {
            widgetId: req.widgetId,
            symbol: req.symbol,
            currentDashboard: req.currentDashboard,
            stockObj: req.stockObj,
            apiKey: apiKey,
            widgetObj: widgetObj,
        }
    })