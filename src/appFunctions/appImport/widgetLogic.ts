import produce from "immer"
import { reqBody } from '../../server/routes/mongoDB/setMongoConfig'
import { menuList, widget, widgetList, stockList, stock, filters, config, dashBoardData } from 'src/App'
import { rRebuildTargetWidgetModel } from 'src/slices/sliceDataModel'
import { tGetFinnhubData } from 'src/thunks/thunkFetchFinnhub'
import { rSetUpdateStatus } from 'src/slices/sliceDataModel'
import { finnHubQueue } from "src/appFunctions/appImport/throttleQueueAPI";
import { rSetDashboardData } from 'src/slices/sliceDashboardData'
import { tSaveDashboard } from 'src/thunks/thunkSaveDashboard'

function uniqueName(widgetName: string, nameList: string[], iterator = 0) {
    const testName = iterator === 0 ? widgetName : widgetName + iterator
    if (nameList.includes(testName)) {
        return uniqueName(widgetName, nameList, iterator + 1)
    } else {
        return testName
    }
}

export const CreateNewWidgetContainer = function (
    widgetDescription: string,
    widgetHeader: string,
    widgetConfig: string,
    defaultFilters: Object = {},
    dashBoardData: dashBoardData,
    currentDashboard: string,
) {
    //receives info for new widget. Returns updated widgetlist & dashboard data
    const widgetName: string = new Date().getTime().toString();
    const widgetStockList = dashBoardData[currentDashboard].globalstocklist
    const widgetList = dashBoardData[currentDashboard].widgetlist
    const widgetIds = widgetList ? Object.keys(widgetList) : []
    const widgetNameList = widgetIds.map((el) => widgetList[el].widgetHeader)
    const useName = uniqueName(widgetHeader, widgetNameList)

    const newWidget: widget = {
        column: 1,
        columnOrder: -1,
        config: {}, //used to save user setup for the widget that does not require new api request.
        filters: defaultFilters, //used to save user setup that requires new api request.
        showBody: true,
        trackedStocks: widgetStockList,
        widgetID: widgetName,
        widgetType: widgetDescription,
        widgetHeader: useName,
        widgetConfig: widgetConfig, //reference to widget type. Menu or data widget.
        xAxis: 20, //prev 5 rem
        yAxis: 20, //prev 5 rem
    };

    const newDashBoardData: dashBoardData = produce(dashBoardData, (draftState) => {
        draftState[currentDashboard].widgetlist[widgetName] = newWidget
    })

    return ([newDashBoardData, widgetName])
}

export const RemoveWidget = async function (widgetID: string | number, dashboardData: dashBoardData, currentDashboard: string) {

    console.log(widgetID, dashboardData, currentDashboard)
    const newDashboardData: dashBoardData = produce(dashboardData, (draftState) => {
        let thisWidgetList = draftState[currentDashboard].widgetlist
        delete thisWidgetList[widgetID]
    })

    return newDashboardData
}

export const UpdateWidgetStockList = function (
    widgetId: string | number,
    symbol: string,
    dashBoardData: dashBoardData,
    currentDashboard: string,
    stockObj: stock | Object = {}) {
    //adds if not present, else removes stock from widget specific stock list.
    if (typeof widgetId === 'number') {

        const newWidgetList = produce(dashBoardData[currentDashboard].widgetlist, (draftState: widgetList) => {
            const trackingSymbolList: stockList = draftState[widgetId]["trackedStocks"]; //copy target widgets stock object

            if (Object.keys(trackingSymbolList).indexOf(symbol) === -1) {
                //add
                let newStock: stock = { ...stockObj } as stock
                trackingSymbolList[symbol] = newStock
                draftState[widgetId]["trackedStocks"] = trackingSymbolList;
            } else {
                //remove stock from list
                delete trackingSymbolList[symbol]
                draftState[widgetId]["trackedStocks"] = trackingSymbolList
            }
        })

        const updatedDashBoard: dashBoardData = produce(dashBoardData, (draftState: dashBoardData) => {
            draftState[currentDashboard].widgetlist = newWidgetList
        })
        return updatedDashBoard
    }
}

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
        const newDashBoardData: dashBoardData = produce(dashBoardData, (draftState: dashBoardData) => {
            draftState[currentDashboard].widgetlist[widgetID].filters = {
                ...draftState[currentDashboard].widgetlist[widgetID].filters,
                ...data
            }
        })

        dispatch(rSetDashboardData(newDashBoardData))
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

    const updatedDashboardData: dashBoardData = produce(dashBoardData, (draftState: dashBoardData) => {
        const oldConfig = draftState[currentDashboard].widgetlist[widgetID].config
        draftState[currentDashboard].widgetlist[widgetID].config = { ...oldConfig, ...updateObj }
    })
    dispatch(rSetDashboardData(updatedDashboardData))

    if (enableDrag !== true) {
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