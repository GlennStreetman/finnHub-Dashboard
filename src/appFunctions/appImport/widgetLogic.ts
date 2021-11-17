import produce from "immer"
import { reqBody } from '../../server/routes/mongoDB/setMongoConfig'
import { rBuildDataModelPayload, rebuildTargetWidgetPayload, rBuildDataModel } from '../../slices/sliceDataModel'
import { tgetFinnHubDataReq, tGetFinnhubData } from './../../thunks/thunkFetchFinnhub'
import { rSetDashboardData, widget, sliceDashboardData, widgetList, stockList, stock, filters, config } from './../../slices/sliceDashboardData'
import { sliceMenuList, rSetMenuList } from './../../slices/sliceMenuList'
import { useAppDispatch, useAppSelector } from './../../hooks';
import { finnHubQueue } from "./../../appFunctions/appImport/throttleQueueAPI";
import { saveDashboard } from "./../../appFunctions/appImport/setupDashboard";


import { rSetUpdateStatus, rRebuildTargetWidgetModel, } from "./../../slices/sliceDataModel";

const useDispatch = useAppDispatch
const useSelector = useAppSelector

function uniqueName(widgetName: string, nameList: string[], iterator = 0) {
    const testName = iterator === 0 ? widgetName : widgetName + iterator
    if (nameList.includes(testName)) {
        return uniqueName(widgetName, nameList, iterator + 1)
    } else {
        return testName
    }
}

export const AddNewWidgetContainer = function (widgetDescription: string, widgetHeader: string, widgetConfig: string, defaultFilters: Object = {}, finnHubQueue: finnHubQueue) {
    // console.log("NEW WIDGET:", widgetDescription, widgetHeader, widgetConfig, defaultFilters)

    const dispatch = useDispatch(); //allows widget to run redux actions.
    const dashboardData = useSelector((state) => { return state.dashboardData })
    const currentDashboard = useSelector((state) => { return state.currentDashboard })
    const apiKey = useSelector((state) => { return state.apiKey })

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
    saveDashboard(currentDash) //save dashboard to server
    const payload: rebuildTargetWidgetPayload = {
        apiKey: apiKey,
        dashboardData: newDashboardData,
        targetDashboard: currentDashboard,
        targetWidget: `${widgetName}`,
    }
    dispatch(rRebuildTargetWidgetModel(payload)) //add new widget to data model
    let updatePayload: tgetFinnHubDataReq = {
        dashboardID: newDashboardData[currentDashboard].id,
        widgetList: [`${widgetName}`],
        finnHubQueue: finnHubQueue,
        rSetUpdateStatus: rSetUpdateStatus,
    }
    dispatch(tGetFinnhubData(updatePayload)) //get data for new widget.
}


export const ChangeWidgetName = function (stateRef: 'widgetList' | 'menuList', widgetID: string | number, newName: string) {

    const dispatch = useDispatch(); //allows widget to run redux actions.
    const dashboardData = useSelector((state) => { return state.dashboardData })
    const currentDashboard = useSelector((state) => { return state.currentDashboard })
    const menuList = useSelector((state) => { return state.menuList })

    // console.log(stateRef, widgetID, newName)
    const widgetList: widgetList = dashboardData[currentDashboard].widgetlist
    const widgetIds = widgetList ? Object.keys(widgetList) : []
    const widgetNameList = widgetIds.map((el) => widgetList[el].widgetHeader)
    // console.log(stateRef, newName, widgetNameList)
    const useName = uniqueName(newName, widgetNameList)
    if (stateRef === 'menuList') {
        const newWidgetList = produce(menuList, (draftState: sliceMenuList) => {
            draftState[widgetID].widgetHeader = useName
        })
        dispatch(rSetMenuList(newWidgetList)) //update menulist
    } else { //widgetList
        const widgetGroup: widgetList = dashboardData[currentDashboard].widgetlist
        const newWidgetList = produce(widgetGroup, (draftState: widgetList) => {
            draftState[widgetID].widgetHeader = useName
        })
        const newDashboardData = produce(dashboardData, (draftState: sliceDashboardData) => {
            draftState[currentDashboard].widgetlist = newWidgetList
        })

        dispatch(rSetDashboardData(newDashboardData))
    }
}

export const RemoveWidget = async function (widgetID: string | number) {

    const dispatch = useDispatch(); //allows widget to run redux actions.
    const dashboardData: sliceDashboardData = useSelector((state) => { return state.dashboardData })
    const currentDashboard = useSelector((state) => { return state.currentDashboard })

    const newDashboardData: sliceDashboardData = produce(dashboardData, (draftState) => {
        let thisWidgetList = draftState[currentDashboard].widgetlist
        delete thisWidgetList[widgetID]
    })

    dispatch(rSetDashboardData(newDashboardData))
    saveDashboard(currentDashboard)
    return true
}

export const UpdateWidgetStockList = function (widgetId: number, symbol: string, stockObj: stock | Object = {}) {
    //adds if not present, else removes stock from widget specific stock list.
    const dispatch = useDispatch(); //allows widget to run redux actions.
    const dashboardData: sliceDashboardData = useSelector((state) => { return state.dashboardData })
    const currentDashboard = useSelector((state) => { return state.currentDashboard })
    const apiKey = useSelector((state) => { return state.apiKey })

    if (isNaN(widgetId) === false) { //verify that widget is not a menu widget.

        const newWidgetList = produce(dashboardData[currentDashboard].widgetlist, (draftState: widgetList) => {
            const trackingSymbolList: stockList = draftState[widgetId]["trackedStocks"]; //copy target widgets stock object

            if (Object.keys(trackingSymbolList).indexOf(symbol) === -1) {
                //add
                let newStock: stock = { ...stockObj } as stock
                newStock['dStock'] = function (ex: string) {
                    if (ex.length === 1) {
                        return (this.symbol)
                    } else {
                        return (this.key)
                    }
                }
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
        saveDashboard(currentDashboard)
        const payload: rBuildDataModelPayload = {
            apiKey: apiKey,
            dashboardData: updatedDashBoard
        }
        dispatch(rBuildDataModel(payload))

    }
}

//widget filters change how data is queried from finnHub
export const UpdateWidgetFilters = async function (widgetID: string, data: filters, finnHubQueue: finnHubQueue) {

    const dispatch = useDispatch(); //allows widget to run redux actions.
    const dashboardData: sliceDashboardData = useSelector((state) => { return state.dashboardData })
    const currentDashboard = useSelector((state) => { return state.currentDashboard })
    const apiKey = useSelector((state) => { return state.apiKey })

    return new Promise(async (resolve, reject) => {
        try {

            const newDashBoardData = produce(dashboardData, (draftState) => {
                draftState[currentDashboard].widgetlist[widgetID].filters = {
                    ...draftState[currentDashboard].widgetlist[widgetID].filters,
                    ...data
                }
            })
            dispatch(rSetDashboardData(newDashBoardData))

            let res = await fetch(`/deleteFinnDashData?widgetID=${widgetID}`)
            if (res.status === 200) {
                dispatch(rRebuildTargetWidgetModel({ //rebuild data model (removes stale dates)
                    apiKey: apiKey,
                    dashboardData: dashboardData,
                    targetDashboard: currentDashboard,
                    targetWidget: widgetID,
                }))
                //remove visable data?
                const getDataPayload: tgetFinnHubDataReq = {//fetch fresh data
                    dashboardID: newDashBoardData[currentDashboard].id,
                    widgetList: [widgetID],
                    finnHubQueue: finnHubQueue,
                    rSetUpdateStatus: rSetUpdateStatus,
                }
                dispatch(tGetFinnhubData(getDataPayload))
                saveDashboard(currentDashboard)
                resolve(true)
            } else { console.log("Problem updating widget filters."); resolve(true) }
            // })
        } catch { console.log("Problem updating widget filters."); resolve(true) }
    })
}

//widget config changes how data is manipulated after being queried.
export const UpdateWidgetConfig = function (widgetID: number, updateObj: config, enableDrag: boolean) { //replaces widget config object then saves changes to mongoDB & postgres.

    const dispatch = useDispatch(); //allows widget to run redux actions.
    const dashboardData: sliceDashboardData = useSelector((state) => { return state.dashboardData })
    const currentDashboard = useSelector((state) => { return state.currentDashboard })

    //config changes used by mongoDB during excel templating.
    const updatedDashboardData = produce(dashboardData, (draftState: sliceDashboardData) => {
        const oldConfig = draftState[currentDashboard].widgetlist[widgetID].config
        draftState[currentDashboard].widgetlist[widgetID].config = { ...oldConfig, ...updateObj }
    })
    dispatch(rSetDashboardData(updatedDashboardData))
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
            .then((response) => { return response.json() })
            .then(() => {
                // console.log('finndash widget config updated in mongoDB.')
            })
    }
}

export const SetWidgetFocus = function (newFocus: string) {

    const dispatch = useDispatch(); //allows widget to run redux actions.
    const dashboardData: sliceDashboardData = useSelector((state) => { return state.dashboardData })
    const currentDashboard = useSelector((state) => { return state.currentDashboard })

    const updatedDashboardData = produce(dashboardData, (draftState: sliceDashboardData) => {
        const wList = draftState[currentDashboard].widgetlist
        for (const x in wList) {
            const widget = wList[x]
            if (widget.trackedStocks[newFocus]) widget.config['targetSecurity'] = newFocus
        }
    })
    dispatch(rSetDashboardData(updatedDashboardData))
}

export const ToggleWidgetBody = function (widgetID: string, stateRef: 'menuWidget' | 'stockWidget') {

    const dispatch = useDispatch(); //allows widget to run redux actions.
    const dashboardData: sliceDashboardData = useSelector((state) => { return state.dashboardData })
    const currentDashboard = useSelector((state) => { return state.currentDashboard })
    const menuList = useSelector((state) => { return state.menuList })

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

export const RemoveDashboardFromState = function (widgetName) {

    const dispatch = useDispatch(); //allows widget to run redux actions.
    const dashboardData: sliceDashboardData = useSelector((state) => { return state.dashboardData })


    const updatedWidget = produce(dashboardData, (draftState: sliceDashboardData) => {
        delete draftState[widgetName]
    })
    dispatch(rSetMenuList(updatedWidget))
}