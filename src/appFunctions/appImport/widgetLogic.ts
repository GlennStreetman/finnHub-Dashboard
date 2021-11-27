import produce from "immer"
import { reqBody } from '../../server/routes/mongoDB/setMongoConfig'
import { AppState, menuList, widget, widgetList, stockList, stock, filters, config, dashBoardData } from 'src/App'
import { rRebuildTargetWidgetModel } from 'src/slices/sliceDataModel'
import { tGetFinnhubData } from 'src/thunks/thunkFetchFinnhub'
import { rSetUpdateStatus } from 'src/slices/sliceDataModel'
import { finnHubQueue } from "src/appFunctions/appImport/throttleQueueAPI";

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


export const ChangeWidgetName = function (widgetID: string | number, newName: string, dashBoardData: dashBoardData, currentDashboard: string,) {

    const widgetList = dashBoardData[currentDashboard].widgetlist
    const widgetIds = widgetList ? Object.keys(widgetList) : []
    const widgetNameList = widgetIds.map((el) => widgetList[el].widgetHeader)

    const useName = uniqueName(newName, widgetNameList)

    const widgetGroup: widgetList = dashBoardData[currentDashboard].widgetlist
    const newWidgetList: widgetList | menuList = produce(widgetGroup, (draftState) => {
        draftState[widgetID].widgetHeader = useName
    })
    const newDashboardData: dashBoardData = produce(dashBoardData, (draftState) => {
        draftState[currentDashboard].widgetlist = newWidgetList
    })
    const payload: Partial<AppState> = {
        'dashBoardData': newDashboardData,
    }
    return payload
}


export const RemoveWidget = async function (widgetID: string | number, dashboardData: dashBoardData, currentDashboard: string) {

    console.log(widgetID, dashboardData, currentDashboard)
    const newDashboardData: dashBoardData = produce(dashboardData, (draftState) => {
        let thisWidgetList = draftState[currentDashboard].widgetlist
        delete thisWidgetList[widgetID]
    })

    const payload: Partial<AppState> = {
        dashBoardData: newDashboardData,
    }
    return payload

}

export const UpdateWidgetStockList = function (widgetId: number, symbol: string, dashBoardData: dashBoardData, currentDashboard: string, stockObj: stock | Object = {}) {
    //adds if not present, else removes stock from widget specific stock list.
    if (isNaN(widgetId) === false) {

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
        const payload: Partial<AppState> = {
            dashBoardData: updatedDashBoard,
        }
        return payload
    }
}

//widget filters change how data is queried from finnHub
export const UpdateWidgetFilters = async function (
    widgetID: string | number,
    data: filters,
    dashBoardData: dashBoardData,
    currentDashboard: string,
    updateAppState: Function,
    dispatch: Function,
    apiKey: string,
    finnHubQueue: finnHubQueue,
    saveDashboard: Function,

) {
    try {
        const newDashBoardData: dashBoardData = produce(dashBoardData, (draftState: dashBoardData) => {
            draftState[currentDashboard].widgetlist[widgetID].filters = {
                ...draftState[currentDashboard].widgetlist[widgetID].filters,
                ...data
            }
        })
        const payload: Partial<AppState> = {
            dashBoardData: newDashBoardData,
        }

        updateAppState(payload).then(() => {
            // delete records from mongoDB then rebuild dataset.
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
            saveDashboard(currentDashboard)
        })
    } catch { console.log("Problem updating widget filters."); return false }

}

//widget config changes how data is manipulated after being queried.
export const updateWidgetConfig = async function (widgetID: number, updateObj: config, dashBoardData: dashBoardData, currentDashboard: string, enableDrag: boolean, saveDashboard: Function, updateAppState: Function) { //replaces widget config object then saves changes to mongoDB & postgres.
    //config changes used by mongoDB during excel templating.
    // console.log('setting up config', widgetID, updateObj)
    const updatedDashboardData: dashBoardData = produce(dashBoardData, (draftState: dashBoardData) => {
        const oldConfig = draftState[currentDashboard].widgetlist[widgetID].config
        draftState[currentDashboard].widgetlist[widgetID].config = { ...oldConfig, ...updateObj }
    })
    const payload: Partial<AppState> = { dashBoardData: updatedDashboardData }
    await updateAppState(payload)
    if (enableDrag !== true) {
        saveDashboard(currentDashboard)
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
        // .then((response) => { return response.json() })
        // .then(() => {
        //     // console.log('finndash widget config updated in mongoDB.')
        // })
    }
}

export const toggleWidgetBody = function (widgetID: string, stateRef: 'menuWidget' | 'stockWidget', dashBoardData: dashBoardData, menuList: menuList, currentDashboard: string) {
    if (stateRef === 'stockWidget') {
        const updatedWidget: dashBoardData = produce(dashBoardData, (draftState: dashBoardData) => {
            draftState[currentDashboard].widgetlist[widgetID].showBody = !draftState[currentDashboard].widgetlist[widgetID].showBody
        })
        return ({ dashBoardData: updatedWidget })
    } else {
        const updatedWidget: menuList = produce(menuList, (draftState: menuList) => {
            draftState[widgetID].showBody = draftState[widgetID].showBody !== undefined ? !draftState[widgetID].showBody : false
        })
        return ({ menuList: updatedWidget })
    }

}