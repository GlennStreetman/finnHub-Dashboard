import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { tChangeWidgetName } from "src/thunks/thunkChangeWidgetName";
import { tUpdateWidgetFilters } from "src/thunks/thunkUpdateWidgetFilters";
import { tSyncGlobalStocklist } from "src/thunks/thunkSyncGlobalStockList";
import { tAddNewWidgetContainer } from "src/thunks/thunkAddNewWidgetContainer";
import { tAddStock } from "src/thunks/thunkAddWidgetSecurity";

// function uniqueName(widgetName: string, nameList: string[], iterator = 0) {
//     const testName = iterator === 0 ? widgetName : widgetName + iterator
//     if (nameList.includes(testName)) {
//         return uniqueName(widgetName, nameList, iterator + 1)
//     } else {
//         return testName
//     }
// }

export interface stock {
    currency: string;
    description: string;
    displaySymbol: string;
    exchange: string;
    figi: string;
    key: string;
    mic: string;
    symbol: string;
    type: string;
}

export interface stockList {
    [key: string]: stock;
}

export interface globalStockList {
    [key: string]: stock;
}

export interface filters {
    //unique to each widget, not required
    [key: string]: any;
}

export interface config {
    //unique to each widget, not required
    [key: string]: any;
}

export interface widget {
    column: string | number; //can be set to drag.
    columnOrder: number;
    config: config;
    filters: filters;
    showBody: boolean;
    trackedStocks: stockList;
    widgetConfig: string;
    widgetHeader: string;
    widgetID: string | number;
    widgetType: string;
    xAxis: number;
    yAxis: number;
}

export interface widgetList {
    [key: string]: widget;
}

export interface dashboard {
    dashboardname: string;
    globalstocklist: globalStockList;
    id: number;
    widgetlist: widgetList;
}

export interface sliceDashboardData {
    [key: string]: dashboard;
}

export interface removeWidgetPayload {
    widgetKey: string | number;
    dashboardName: string;
}

export interface updateFilter {
    newFilters: filters;
    currentDashboard: string;
    widgetID: string | number;
}

export interface updateConfig {
    newConfig: config;
    currentDashboard: string;
    widgetID: string | number;
}

export interface updateGlobalStockList {
    stockRef: string;
    currentDashboard: string;
    stockObj: stock | false;
}

export interface replaceGlobalList {
    stockObj: stockList;
    currentDashboard: string;
}

export interface setWidgetStockList {
    widgetId: string | number;
    symbol: string;
    currentDashboard: string;
    stockObj: stock | false;
}

export interface addWidget {
    widgetDescription: string;
    widgetHeader: string;
    widgetConfig: string;
    defaultFilters: Object;
    currentDashboard: string;
}

export interface changeWidgetOrder {
    dashboard: string;
    widgetId: string | number;
    newPlacement: string | number;
    column: string | number;
}

const initialState: sliceDashboardData = {};

const dashboardData = createSlice({
    name: "dashboardData",
    initialState,
    reducers: {
        rSetDashboardData: (state: sliceDashboardData, action: any) => {
            const ap: sliceDashboardData = action.payload;
            state = ap;
            return state;
        },
        rRemoveWidget: (state: sliceDashboardData, action: PayloadAction<removeWidgetPayload>) => {
            const ap = action.payload;
            const widgetList = state[ap.dashboardName].widgetlist;
            const deleteColumn = state[ap.dashboardName].widgetlist[ap.widgetKey].column;
            delete state[ap.dashboardName].widgetlist[ap.widgetKey];

            const updateList: widget[] = [];
            const reOrderList = Object.values(widgetList).reduce((acc, w) => {
                //get list of widgets that need to be reordered, not includeing target widget
                if (w.column === deleteColumn) {
                    acc.push(w);
                    return acc;
                } else {
                    return acc;
                }
            }, updateList);

            reOrderList.sort((a, b) => {
                //sort widget list by columnOrder
                if (a.columnOrder < b.columnOrder) {
                    return -1;
                } else if (a.columnOrder > b.columnOrder) {
                    return 1;
                } else {
                    return 0;
                }
            });

            reOrderList.forEach((el, i) => {
                //reorder based on index locaiton of reOrderList
                if (el.columnOrder !== i) {
                    widgetList[el.widgetID].columnOrder = i;
                }
            });

            return state;
        },
        rSetWidgetFilters: (state: sliceDashboardData, action: PayloadAction<updateFilter>) => {
            //filters are used for API pulls. UPdate here will trigger finnHub.io api calls.
            const ap = action.payload;
            state[ap.currentDashboard].widgetlist[ap.widgetID].filters = {
                ...state[ap.currentDashboard].widgetlist[ap.widgetID].filters,
                ...ap.newFilters,
            };
            return state;
        },
        rSetWidgetConfig: (state: sliceDashboardData, action: PayloadAction<updateConfig>) => {
            //filters are used for API pulls. UPdate here will trigger finnHub.io api calls.
            const ap = action.payload;
            state[ap.currentDashboard].widgetlist[ap.widgetID].config = {
                ...state[ap.currentDashboard].widgetlist[ap.widgetID].config,
                ...ap.newConfig,
            };
            return state;
        },
        rSetGlobalStockList: (state: sliceDashboardData, action: PayloadAction<updateGlobalStockList>) => {
            //add or remove a global stock.
            const ap = action.payload;
            const globalStockList = state[ap.currentDashboard].globalstocklist;

            if (globalStockList[ap.stockRef] === undefined && ap.stockObj) {
                globalStockList[ap.stockRef] = ap.stockObj;
            } else {
                delete globalStockList[ap.stockRef];
            }

            return state;
        },
        rReplaceGlobalStocklist: (state: sliceDashboardData, action: PayloadAction<replaceGlobalList>) => {
            //replace entire stock list.
            const ap = action.payload;
            state[ap.currentDashboard].globalstocklist = ap.stockObj;
            return state;
        },
        rSetWidgetStockList: (state: sliceDashboardData, action: PayloadAction<setWidgetStockList>) => {
            const ap = action.payload;
            let trackedStocks: stockList = state[ap.currentDashboard].widgetlist[ap.widgetId]["trackedStocks"]; //copy target widgets stock object
            if (Object.keys(trackedStocks).indexOf(ap.symbol) === -1 && ap.stockObj) {
                //add
                trackedStocks = { ...trackedStocks };
                trackedStocks[ap.symbol] = ap.stockObj;
            } else {
                //remove
                delete trackedStocks[ap.symbol];
            }
            return state;
        },
        rChangeWidgetColumnOrder: (state: sliceDashboardData, action: PayloadAction<changeWidgetOrder>) => {
            const ap = action.payload;
            const widgetList = state[ap.dashboard].widgetlist;
            const targetWidget = widgetList[ap.widgetId];
            if (targetWidget.column !== ap.column) targetWidget.column = ap.column;
            // const length = Object.keys(widgetList).length - 1
            const updateList: widget[] = [];

            const reOrderList = Object.values(widgetList).reduce((acc, w) => {
                //get list of widgets that need to be reordered, not includeing target widget
                if (w.column === ap.column && w.widgetID !== ap.widgetId) {
                    acc.push(w);
                    return acc;
                } else {
                    return acc;
                }
            }, updateList);

            reOrderList.sort((a, b) => {
                //sort widget list by columnOrder
                if (a.columnOrder < b.columnOrder) {
                    return -1;
                } else if (a.columnOrder > b.columnOrder) {
                    return 1;
                } else {
                    return 0;
                }
            });
            reOrderList.splice(Number(ap.newPlacement), 0, targetWidget); // add moved widget into list
            reOrderList.forEach((el, i) => {
                //reorder based on index locaiton of reOrderList
                if (el.columnOrder !== i) {
                    widgetList[el.widgetID].columnOrder = i;
                }
            });
        },
    },
    extraReducers: {
        [tChangeWidgetName.pending.toString()]: (state) => {
            return state;
        },
        [tChangeWidgetName.rejected.toString()]: (state, action) => {
            console.log("failed to update widget name: ", action);
            return state;
        },
        [tChangeWidgetName.fulfilled.toString()]: (state, action) => {
            // console.log("updating widget name in redux", action.payload.rSetDashboardData);
            try {
                if (action.payload.rSetDashboardData) {
                    console.log("updating widget name", action.payload.rSetDashboardData);
                    let data = action.payload.rSetDashboardData;
                    state = data;
                    return state;
                }
            } catch {
                console.log("error updating widget name in redux.");
            }
        },
        [tUpdateWidgetFilters.pending.toString()]: (state) => {
            return state;
        },
        [tUpdateWidgetFilters.rejected.toString()]: (state, action) => {
            console.log("failed to update widget filters: ", action);
            return state;
        },
        [tUpdateWidgetFilters.fulfilled.toString()]: (state, action) => {
            let currentDashboard = action.payload.currentDashboard;
            let widgetID = action.payload.widgetID;
            let filters = action.payload.filters;

            state[currentDashboard].widgetlist[widgetID][currentDashboard].filters = filters;
        },
        [tSyncGlobalStocklist.fulfilled.toString()]: (state, action) => {
            const ap: sliceDashboardData = action.payload.dashboardData;
            state = ap;
            return state;
        },
        [tAddNewWidgetContainer.fulfilled.toString()]: (state, action) => {
            const newWidget = action.payload.newWidget;
            const currentDashboard = action.payload.currentDashboard;
            const widgetName = newWidget.widgetID;
            state[currentDashboard].widgetlist[widgetName] = newWidget;
            return state;
        },
        [tAddStock.fulfilled.toString()]: (state, action) => {
            const ap = action.payload;
            const trackedStocks: stockList = state[ap.currentDashboard].widgetlist[ap.widgetId]["trackedStocks"]; //copy target widgets stock object
            if (Object.keys(trackedStocks).indexOf(ap.symbol) === -1 && ap.stockObj) {
                //add
                trackedStocks[ap.symbol] = ap.stockObj;
            } else {
                //remove
                delete trackedStocks[ap.symbol];
            }
            return state;
        },
    },
});

export const {
    rSetDashboardData,
    rRemoveWidget,
    rSetWidgetFilters,
    rSetWidgetConfig,
    rSetGlobalStockList,
    rReplaceGlobalStocklist,
    rSetWidgetStockList,
    rChangeWidgetColumnOrder,
} = dashboardData.actions;
export default dashboardData.reducer;
