import produce from "immer"
import { reqBody } from '../../server/routes/mongoDB/setMongoConfig'
import { AppState, AppProps } from './../../App'
import { rBuildDataModelPayload, rebuildTargetWidgetPayload } from '../../slices/sliceDataModel'
import { tgetFinnHubDataReq } from './../../thunks/thunkFetchFinnhub'
import { widget, sliceDashboardData, widgetList, stockList, stock, filters, config } from './../../slices/sliceDashboardData'
import { sliceMenuList } from './../../slices/sliceMenuList'

function uniqueName(widgetName: string, nameList: string[], iterator = 0) {
    const testName = iterator === 0 ? widgetName : widgetName + iterator
    if (nameList.includes(testName)) {
        return uniqueName(widgetName, nameList, iterator + 1)
    } else {
        return testName
    }
}

export const NewMenuContainer = function newMenuContainer(widgetDescription: string, widgetHeader: string, widgetConfig: string) {
    const widgetName = widgetDescription;
    const menuList: sliceMenuList = this.props.menuList

    let newMenuList = produce(menuList, (draftState: sliceMenuList) => {
        draftState[widgetName] = {
            column: 0,
            columnOrder: -1,
            widgetID: widgetName,
            widgetType: widgetDescription,
            widgetHeader: widgetHeader,
            xAxis: "5rem",
            yAxis: "5rem",
            widgetConfig: widgetConfig,
            showBody: true,
        };
    });
    this.props.rSetMenuList(newMenuList)
}

export const AddNewWidgetContainer = function AddNewWidgetContainer(widgetDescription: string, widgetHeader: string, widgetConfig: string, defaultFilters: Object = {}) {
    //receives info for new widget. Returns updated widgetlist & dashboard data
    // console.log("NEW WIDGET:", widgetDescription, widgetHeader, widgetConfig, defaultFilters)
    const s: AppState = this.state
    const p: AppProps = this.props
    const currentDashboard = this.props.currentDashboard
    const widgetName: string = new Date().getTime().toString();
    const widgetStockList = this.props.dashboardData[currentDashboard].globalstocklist

    const widgetList = this.props.dashboardData[this.props.currentDashboard].widgetlist
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

    const currentDash: string = this.props.currentDashboard
    const newDashboardData: sliceDashboardData = produce(p.dashboardData, (draftState: sliceDashboardData) => {
        draftState[currentDash].widgetlist[widgetName] = newWidget
    })

    this.props.rSetDashboardData(newDashboardData)
    this.saveDashboard(currentDash)
    const payload: rebuildTargetWidgetPayload = {
        apiKey: p.apiKey,
        dashboardData: newDashboardData,
        targetDashboard: currentDashboard,
        targetWidget: `${widgetName}`,
    }
    this.props.rRebuildTargetWidgetModel(payload)
    let updatePayload: tgetFinnHubDataReq = {
        dashboardID: newDashboardData[this.props.currentDashboard].id,
        widgetList: [`${widgetName}`],
        finnHubQueue: s.finnHubQueue,
        rSetUpdateStatus: this.props.rSetUpdateStatus,
    }
    this.props.tGetFinnhubData(updatePayload)
}


export const ChangeWidgetName = function (stateRef: 'widgetList' | 'menuList', widgetID: string | number, newName: string) {
    // console.log(stateRef, widgetID, newName)
    const widgetList: widgetList = this.props.dashboardData[this.props.currentDashboard].widgetlist
    const widgetIds = widgetList ? Object.keys(widgetList) : []
    const widgetNameList = widgetIds.map((el) => widgetList[el].widgetHeader)
    // console.log(stateRef, newName, widgetNameList)
    const useName = uniqueName(newName, widgetNameList)
    if (stateRef === 'menuList') {
        const widgetGroup: sliceMenuList = this.props[stateRef]
        const newWidgetList = produce(widgetGroup, (draftState: sliceMenuList) => {
            draftState[widgetID].widgetHeader = useName
        })
        this.propsrSetMenuList(newWidgetList)
    } else { //widgetList
        const widgetGroup: widgetList = this.props.dashboardData[this.props.currentDashboard].widgetlist
        const newWidgetList = produce(widgetGroup, (draftState: widgetList) => {
            draftState[widgetID].widgetHeader = useName
        })
        const newDashboardData = produce(this.props.dashboardData, (draftState: sliceDashboardData) => {
            draftState[this.props.currentDashboard].widgetlist = newWidgetList
        })

        this.props.rSetDashboardData(newDashboardData)
    }
}

export const RemoveWidget = async function (widgetID: string | number) {

    let dashboardData: sliceDashboardData = this.props.dashboardData
    const newDashboardData: sliceDashboardData = produce(dashboardData, (draftState) => {
        let thisWidgetList = draftState[this.props.currentDashboard].widgetlist
        delete thisWidgetList[widgetID]
    })

    this.props.rSetDashboardData(newDashboardData)
    this.saveDashboard(this.props.currentDashboard)
    return true
}

export const LockWidgets = function (toggle: number) {
    const payload: Partial<AppState> = { widgetLockDown: toggle }
    this.setState(payload)
}

export const UpdateWidgetStockList = function updateWidgetStockList(widgetId: number, symbol: string, stockObj: stock | Object = {}) {
    //adds if not present, else removes stock from widget specific stock list.
    if (isNaN(widgetId) === false) {

        const newWidgetList = produce(this.props.dashboardData[this.props.currentDashboard].widgetlist, (draftState: widgetList) => {
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

        const updatedDashBoard = produce(this.props.dashboardData, (draftState) => {
            draftState[this.props.currentDashboard].widgetlist = newWidgetList
        })
        this.props.rSetDashboardData(updatedDashBoard)
        this.saveDashboard(this.props.currentDashboard)
        const payload: rBuildDataModelPayload = {
            apiKey: this.state.apiKey,
            dashboardData: this.props.dashboardData
        }
        this.props.rBuildDataModel(payload)

    }
}

//widget filters change how data is queried from finnHub
export const UpdateWidgetFilters = async function (widgetID: string, data: filters) {
    return new Promise(async (resolve, reject) => {
        try {

            const newDashBoardData = produce(this.props.dashboardData, (draftState) => {
                draftState[this.props.currentDashboard].widgetlist[widgetID].filters = {
                    ...draftState[this.props.currentDashboard].widgetlist[widgetID].filters,
                    ...data
                }
            })
            this.props.rSetDashboardData(newDashBoardData)

            let res = await fetch(`/deleteFinnDashData?widgetID=${widgetID}`)
            if (res.status === 200) {
                this.props.rRebuildTargetWidgetModel({ //rebuild data model (removes stale dates)
                    apiKey: this.state.apiKey,
                    dashboardData: this.state.dashboardData,
                    targetDashboard: this.props.currentDashboard,
                    targetWidget: widgetID,
                })
                //remove visable data?
                const getDataPayload: tgetFinnHubDataReq = {//fetch fresh data
                    dashboardID: newDashBoardData[this.props.currentDashboard].id,
                    widgetList: [widgetID],
                    finnHubQueue: this.state.finnHubQueue,
                    rSetUpdateStatus: this.props.rSetUpdateStatus,
                }
                this.props.tGetFinnhubData(getDataPayload)
                this.saveDashboard(this.props.currentDashboard)
                resolve(true)
            } else { console.log("Problem updating widget filters."); resolve(true) }
            // })
        } catch { console.log("Problem updating widget filters."); resolve(true) }
    })
}

//widget config changes how data is manipulated after being queried.
export const updateWidgetConfig = function (widgetID: number, updateObj: config) { //replaces widget config object then saves changes to mongoDB & postgres.
    //config changes used by mongoDB during excel templating.
    const updatedDashboardData = produce(this.props.dashboardData, (draftState: sliceDashboardData) => {
        const oldConfig = draftState[this.props.currentDashboard].widgetlist[widgetID].config
        draftState[this.props.currentDashboard].widgetlist[widgetID].config = { ...oldConfig, ...updateObj }
    })
    this.props.rSetDashboardData(updatedDashboardData)
    if (this.state.enableDrag !== true) {
        this.saveDashboard(this.props.currentDashboard)
        const updatedWidgetFilters = updatedDashboardData[this.props.currentDashboard].widgetlist[widgetID].config
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

export const setWidgetFocus = function (newFocus: string) {
    const updatedDashboardData = produce(this.props.dashboardData, (draftState: sliceDashboardData) => {
        const wList = draftState[this.props.currentDashboard].widgetlist
        for (const x in wList) {
            const widget = wList[x]
            if (widget.trackedStocks[newFocus]) widget.config['targetSecurity'] = newFocus
        }
    })
    this.props.rSetDashboardDataupdatedDashboardData(updatedDashboardData)
}

export const ToggleWidgetVisability = function toggleWidgetVisability() {
    const s: AppState = this.state
    const payload: Partial<AppState> = { showStockWidgets: s.showStockWidgets === 0 ? 1 : 0 }
    this.setState(payload)
}

export const toggleWidgetBody = function (widgetID: string, stateRef: 'menuWidget' | 'stockWidget') {
    if (stateRef === 'stockWidget') {
        const updatedWidget = produce(this.props.dashboardData, (draftState: sliceDashboardData) => {
            draftState[this.props.currentDashboard].widgetlist[widgetID].showBody = !draftState[this.props.currentDashboard].widgetlist[widgetID].showBody
        })
        this.props.rSetDashboardData(updatedWidget)
    } else { //menuWidget
        const updatedWidget = produce(this.props.menuList, (draftState: sliceMenuList) => {
            draftState[widgetID].showBody = draftState[widgetID].showBody !== undefined ? !draftState[widgetID].showBody : false
        })
        this.props.rSetMenuList(updatedWidget)
    }

}

export const removeDashboardFromState = function (widgetName) {
    const updatedWidget = produce(this.props.dashboardData, (draftState: sliceDashboardData) => {
        delete draftState[widgetName]
    })
    this.props.rSetMenuList(updatedWidget)
}