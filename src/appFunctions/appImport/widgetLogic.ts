import produce from "immer"

import { AppState, setApp } from './../../App'
import { reqBody } from '../../server/routes/mongoDB/setMongoConfig'
import { rBuildDataModelPayload, rebuildTargetWidgetPayload, rBuildDataModel } from '../../slices/sliceDataModel'
import { tgetFinnHubDataReq, tGetFinnhubData } from './../../thunks/thunkFetchFinnhub'
import { rSetDashboardData, widget, sliceDashboardData, widgetList, stockList, stock, filters, config } from './../../slices/sliceDashboardData'
import { sliceMenuList, rSetMenuList } from './../../slices/sliceMenuList'
import { finnHubQueue } from "./../../appFunctions/appImport/throttleQueueAPI";
import { SaveDashboard } from "./../../appFunctions/appImport/setupDashboard";
import { rSetUpdateStatus, rRebuildTargetWidgetModel, } from "./../../slices/sliceDataModel";
import { tUpdateWidgetFilters } from 'src/thunks/thunkUpdateWidgetFilters'


export function uniqueName(widgetName: string, nameList: string[], iterator = 0) {
    const testName = iterator === 0 ? widgetName : widgetName + iterator
    if (nameList.includes(testName)) {
        return uniqueName(widgetName, nameList, iterator + 1)
    } else {
        return testName
    }
}

export const AddNewWidgetContainer = function (
    dispatch: Function,
    widgetDescription: string,
    widgetHeader: string,
    widgetConfig: string,
    defaultFilters: Object = {},
    finnHubQueue: finnHubQueue,
    AppState: AppState,
    setApp: setApp,
    dashboardData: sliceDashboardData,
    currentDashboard: string,
    apiKey: string,
) {
    // console.log("NEW WIDGET:", widgetDescription, widgetHeader, widgetConfig, defaultFilters)
    const widgetName: string = new Date().getTime().toString();
    const widgetStockList = dashboardData[currentDashboard].globalstocklist

    const widgetList = dashboardData[currentDashboard].widgetlist
    const widgetIds = widgetList ? Object.keys(widgetList) : []
    const widgetNameList = widgetIds.map((el) => widgetList[el].widgetHeader)
    // console.log(stateRef, newName, widgetNameList)
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

    const currentDash: string = currentDashboard
    const newDashboardData: sliceDashboardData = produce(dashboardData, (draftState: sliceDashboardData) => {
        draftState[currentDash].widgetlist[widgetName] = newWidget
    })

    dispatch(rSetDashboardData(newDashboardData)) //add widget to dashboardDaata
    SaveDashboard(currentDash, AppState, setApp) //save dashboard to server
    const payload: rebuildTargetWidgetPayload = {
        apiKey: apiKey,
        filters: defaultFilters,
        targetDashboard: currentDashboard,
        targetWidget: `${widgetName}`,
    }
    dispatch(rRebuildTargetWidgetModel(payload)) //add new widget to data model
    let updatePayload: tgetFinnHubDataReq = {
        currentDashboard: currentDashboard,
        widgetList: [`${widgetName}`],
        finnHubQueue: finnHubQueue,
    }
    dispatch(tGetFinnhubData(updatePayload)) //get data for new widget.
}

export const RemoveWidget = async function (
    dispatch: Function,
    widgetID: string | number,
    AppState: AppState,
    setApp: setApp,
    dashboardData: sliceDashboardData,
    currentDashboard: string,
) {

    const newDashboardData: sliceDashboardData = produce(dashboardData, (draftState) => {
        let thisWidgetList = draftState[currentDashboard].widgetlist
        delete thisWidgetList[widgetID]
    })

    dispatch(rSetDashboardData(newDashboardData))
    SaveDashboard(currentDashboard, AppState, setApp)
    return true
}

export const UpdateWidgetStockList = function (
    dispatch: Function,
    widgetId: number,
    symbol: string,
    stockObj: stock | Object = {},
    AppState: AppState,
    setApp: setApp,
    dashboardData: sliceDashboardData,
    currentDashboard: string,
    apiKey: string,
) {
    //adds if not present, else removes stock from widget specific stock list.

    if (isNaN(widgetId) === false) { //verify that widget is not a menu widget.

        const newWidgetList = produce(dashboardData[currentDashboard].widgetlist, (draftState: widgetList) => {
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

        const updatedDashBoard = produce(dashboardData, (draftState) => {
            draftState[currentDashboard].widgetlist = newWidgetList
        })
        dispatch(rSetDashboardData(updatedDashBoard))
        SaveDashboard(currentDashboard, AppState, setApp)
        const payload: rBuildDataModelPayload = {
            apiKey: apiKey,
            dashboardData: updatedDashBoard
        }
        dispatch(rBuildDataModel(payload))

    }
}

//widget filters change how data is queried from finnHub
export const UpdateWidgetFilters = async function (
    dispatch: Function,
    currentDashboard: string,
    widgetID: string,
    filters: filters,
    finnHubQueue: finnHubQueue,
    AppState: AppState,
    setApp: setApp,
) {

    return new Promise(async (resolve, reject) => {
        try {
            await dispatch(tUpdateWidgetFilters({
                currentDashboard: currentDashboard,
                widgetID: widgetID,
                filters: filters,
            }))

            const getDataPayload: tgetFinnHubDataReq = {//fetch fresh data
                currentDashboard: currentDashboard,
                widgetList: [widgetID],
                finnHubQueue: finnHubQueue,
            }
            dispatch(tGetFinnhubData(getDataPayload))
            SaveDashboard(currentDashboard, AppState, setApp)
            resolve(true)
        } catch { console.log("Problem updating widget filters."); resolve(true) }
    })
}

//widget config changes how data is manipulated after being queried.
export const UpdateWidgetConfig = function (
    dispatch: Function,
    widgetID: number,
    updateObj: config,
    enableDrag: boolean,
    AppState: AppState,
    setApp: setApp,
    dashboardData: sliceDashboardData,
    currentDashboard: string,
) { //replaces widget config object then saves changes to mongoDB & postgres.

    //config changes used by mongoDB during excel templating.
    const updatedDashboardData = produce(dashboardData, (draftState: sliceDashboardData) => {
        const oldConfig = draftState[currentDashboard].widgetlist[widgetID].config
        draftState[currentDashboard].widgetlist[widgetID].config = { ...oldConfig, ...updateObj }
    })
    dispatch(rSetDashboardData(updatedDashboardData))
    if (enableDrag !== true) {
        SaveDashboard(currentDashboard, AppState, setApp)
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
            .then((response) => { return response.json() })
            .then(() => {
                // console.log('finndash widget config updated in mongoDB.')
            })
    }
}

export const SetWidgetFocus = function (dispatch: Function, dashboardData: sliceDashboardData, currentDashboard: string, newFocus: string) {

    const updatedDashboardData = produce(dashboardData, (draftState: sliceDashboardData) => {
        const wList = draftState[currentDashboard].widgetlist
        for (const x in wList) {
            const widget = wList[x]
            if (widget.trackedStocks[newFocus]) widget.config['targetSecurity'] = newFocus
        }
    })
    dispatch(rSetDashboardData(updatedDashboardData))
}

export const ToggleWidgetBody = function (
    dispatch: Function,
    widgetID: string | number,
    stateRef: string,
    dashboardData: sliceDashboardData,
    currentDashboard: string,
    menuList: sliceMenuList,
) {

    if (stateRef === 'stockWidget') {
        const updatedWidget = produce(dashboardData, (draftState: sliceDashboardData) => {
            draftState[currentDashboard].widgetlist[widgetID].showBody = !draftState[currentDashboard].widgetlist[widgetID].showBody
        })
        dispatch(rSetDashboardData(updatedWidget))
    } else { //menuWidget
        const updatedWidget = produce(menuList, (draftState: sliceMenuList) => {
            draftState[widgetID].showBody = draftState[widgetID].showBody !== undefined ? !draftState[widgetID].showBody : false
        })
        dispatch(rSetMenuList(updatedWidget))
    }

}

export const RemoveDashboardFromState = function (dispatch: Function, widgetName: string | number, dashboardData: sliceDashboardData) {

    const updatedWidget = produce(dashboardData, (draftState: sliceDashboardData) => {
        delete draftState[widgetName]
    })
    dispatch(rSetMenuList(updatedWidget))
}