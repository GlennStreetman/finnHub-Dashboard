import { createSlice } from '@reduxjs/toolkit';

export interface stock {
    currency: string,
    dStock: Function,
    description: string,
    displaySymbol: string,
    exchange: string,
    figi: string,
    key: string,
    mic: string,
    symbol: string,
    type: string,
}

export interface stockList {
    [key: string]: stock
}

export interface globalStockList {
    [key: string]: stock
}

export interface filters { //unique to each widget, not required
    [key: string]: any
}

export interface config { //unique to each widget, not required
    [key: string]: any
}

export interface widget {
    column: string | number, //can be set to drag.
    columnOrder: number,
    config: config,
    filters: filters,
    showBody: boolean,
    trackedStocks: stockList,
    widgetConfig: string,
    widgetHeader: string,
    widgetID: string | number,
    widgetType: string,
    xAxis: number,
    yAxis: number,
}

export interface widgetList {
    [key: string]: widget
}

export interface dashboard {
    dashboardname: string,
    globalstocklist: globalStockList,
    id: number,
    widgetlist: widgetList
}

export interface sliceDashboardData {
    [key: string]: dashboard,
}

const initialState: sliceDashboardData = {}

const dashboardData = createSlice({
    name: 'dashboardData',
    initialState,
    reducers: {
        rSetDashboardData: (state: sliceDashboardData, action: any) => {
            const ap: sliceDashboardData = action.payload
            state = ap
            return state
        },
    },
})

export const {
    rSetDashboardData,
} = dashboardData.actions
export default dashboardData.reducer
