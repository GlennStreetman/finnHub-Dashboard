import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { tChangeWidgetName } from 'src/thunks/thunkChangeWidgetName'
import { tUpdateWidgetFilters } from 'src/thunks/thunkUpdateWidgetFilters'
import { tSyncGlobalStocklist } from 'src/thunks/thunkSyncGlobalStockList'

export interface stock {
    currency: string,
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

export interface removeWidgetPayload {
    widgetKey: string | number,
    dashboardName: string,
}

export interface updateFilter {
    newFilters: filters
    currentDashboard: string,
    widgetID: string | number,
}

export interface updateConfig {
    newConfig: config
    currentDashboard: string,
    widgetID: string | number,
}

export interface updateGlobalStockList {
    stockRef: string,
    currentDashboard: string,
    stockObj: stock | false,
}

export interface replaceGlobalList {
    stockObj: stockList,
    currentDashboard: string,
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
        rRemoveWidget: (state: sliceDashboardData, action: PayloadAction<removeWidgetPayload>) => {
            const ap = action.payload
            console.log('removing', ap, state[ap.dashboardName], state[ap.dashboardName].widgetlist, state[ap.dashboardName].widgetlist[ap.widgetKey])
            delete state[ap.dashboardName].widgetlist[ap.widgetKey]
            return state
        },
        rSetWidgetFilters: (state: sliceDashboardData, action: PayloadAction<updateFilter>) => { //filters are used for API pulls. UPdate here will trigger finnHub.io api calls.
            const ap = action.payload
            state[ap.currentDashboard].widgetlist[ap.widgetID].filters = {
                ...state[ap.currentDashboard].widgetlist[ap.widgetID].filters,
                ...ap.newFilters
            }
            return state
        },
        rSetWidgetConfig: (state: sliceDashboardData, action: PayloadAction<updateConfig>) => { //filters are used for API pulls. UPdate here will trigger finnHub.io api calls.
            const ap = action.payload
            state[ap.currentDashboard].widgetlist[ap.widgetID].config = {
                ...state[ap.currentDashboard].widgetlist[ap.widgetID].config,
                ...ap.newConfig
            }
            return state
        },
        rSetGlobalStockList: (state: sliceDashboardData, action: PayloadAction<updateGlobalStockList>) => { //add or remove a global stock.
            const ap = action.payload
            const globalStockList = state[ap.currentDashboard].globalstocklist

            if (globalStockList[ap.stockRef] === undefined && ap.stockObj) {
                globalStockList[ap.stockRef] = ap.stockObj
            } else {
                delete globalStockList[ap.stockRef];
            }

            return state
        },
        rReplaceGlobalStocklist: (state: sliceDashboardData, action: PayloadAction<replaceGlobalList>) => { //replace entire stock list.
            const ap = action.payload
            state[ap.currentDashboard].globalstocklist = ap.stockObj
            return state
        },

    },
    extraReducers: {
        [tChangeWidgetName.pending.toString()]: (state) => {
            return state
        },
        [tChangeWidgetName.rejected.toString()]: (state, action) => {
            console.log('failed to update widget name: ', action)
            return state
        },
        [tChangeWidgetName.fulfilled.toString()]: (state, action) => {
            try {
                if (action.payload.rSetDashboardData) {
                    let data = action.payload.rSetDashboardData
                    state = data
                }
            } catch {
                console.log('error updating widget name in redux.')
            }
        },
        [tUpdateWidgetFilters.pending.toString()]: (state) => {
            return state
        },
        [tUpdateWidgetFilters.rejected.toString()]: (state, action) => {
            console.log('failed to update widget filters: ', action)
            return state
        },
        [tUpdateWidgetFilters.fulfilled.toString()]: (state, action) => {
            let currentDashboard = action.payload.currentDashboard
            let widgetID = action.payload.widgetID
            let filters = action.payload.filters

            state[currentDashboard].widgetlist[widgetID][currentDashboard].filters = filters

        },
        [tSyncGlobalStocklist.fulfilled.toString()]: (state, action) => {
            const ap: sliceDashboardData = action.payload.dashboardData
            state = ap
            return state
        },
    }
})

export const {
    rSetDashboardData,
    rRemoveWidget,
    rSetWidgetFilters,
    rSetWidgetConfig,
    rSetGlobalStockList,
    rReplaceGlobalStocklist,
} = dashboardData.actions
export default dashboardData.reducer