import produce from "immer"
import { reqBody } from '../../server/routes/mongoDB/setMongoConfig'
import { AppState, AppProps, menuList, widget, widgetList, stockList, stock, filters, config, dashBoardData } from 'src/App'
import { rBuildDataModelPayload } from '../../slices/sliceDataModel'
import { tgetFinnHubDataReq } from './../../thunks/thunkFetchFinnhub'
import { finnHubQueue } from "src/appFunctions/appImport/throttleQueueAPI";

function uniqueName(widgetName: string, nameList: string[], iterator = 0) {
    const testName = iterator === 0 ? widgetName : widgetName + iterator
    if (nameList.includes(testName)) {
        return uniqueName(widgetName, nameList, iterator + 1)
    } else {
        return testName
    }
}

// export const NewMenuContainer = function newMenuContainer(widgetDescription: string, widgetHeader: string, widgetConfig: string, menuList: menuList, updateAppState) {

//     let newMenuList = produce(menuList, (draftState: menuList) => {
//         draftState[widgetDescription] = {
//             column: 0,
//             columnOrder: -1,
//             widgetID: widgetDescription,
//             widgetType: widgetDescription,
//             widgetHeader: widgetHeader,
//             xAxis: "5rem",
//             yAxis: "5rem",
//             widgetConfig: widgetConfig,
//             showBody: true,
//         };
//     });
//     const payload: Partial<AppState> = { menuList: newMenuList }
//     updateAppState(payload);
// }

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


export const ChangeWidgetName = function (widgetID: string | number, newName: string, dashBoardData: dashBoardData, currentDashBoard: string,) {

    const widgetList = dashBoardData[currentDashBoard].widgetlist
    const widgetIds = widgetList ? Object.keys(widgetList) : []
    const widgetNameList = widgetIds.map((el) => widgetList[el].widgetHeader)

    const useName = uniqueName(newName, widgetNameList)

    const widgetGroup: widgetList = dashBoardData[currentDashBoard].widgetlist
    const newWidgetList: widgetList | menuList = produce(widgetGroup, (draftState) => {
        draftState[widgetID].widgetHeader = useName
    })
    const newDashboardData: dashBoardData = produce(dashBoardData, (draftState) => {
        draftState[currentDashBoard].widgetlist = newWidgetList
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

export const UpdateWidgetStockList = function updateWidgetStockList(widgetId: number, symbol: string, stockObj: stock | Object = {}) {
    //adds if not present, else removes stock from widget specific stock list.
    const s: AppState = this.state
    if (isNaN(widgetId) === false) {

        const newWidgetList = produce(s.dashBoardData[s.currentDashBoard].widgetlist, (draftState: widgetList) => {
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

        const updatedDashBoard: dashBoardData = produce(s.dashBoardData, (draftState: dashBoardData) => {
            draftState[s.currentDashBoard].widgetlist = newWidgetList
        })
        const payload: Partial<AppState> = {
            dashBoardData: updatedDashBoard,
        }
        this.setState(payload, () => {
            this.saveDashboard(this.state.currentDashBoard)

            const payload: rBuildDataModelPayload = {
                apiKey: this.state.apiKey,
                dashBoardData: this.state.dashBoardData
            }
            this.props.rBuildDataModel(payload)
        });
    }
}

//widget filters change how data is queried from finnHub
export const UpdateWidgetFilters = async function (widgetID: string, data: filters) {
    return new Promise((resolve, reject) => {
        try {
            const s: AppState = this.state
            const p: AppProps = this.props

            const newDashBoardData: dashBoardData = produce(s.dashBoardData, (draftState: dashBoardData) => {
                draftState[s.currentDashBoard].widgetlist[widgetID].filters = {
                    ...draftState[s.currentDashBoard].widgetlist[widgetID].filters,
                    ...data
                }
            })
            const payload: Partial<AppState> = {
                dashBoardData: newDashBoardData,
            }
            this.setState(payload, async () => {
                //delete records from mongoDB then rebuild dataset.
                let res = await fetch(`/deleteFinnDashData?widgetID=${widgetID}`)
                if (res.status === 200) {
                    p.rRebuildTargetWidgetModel({ //rebuild data model (removes stale dates)
                        apiKey: this.state.apiKey,
                        dashBoardData: this.state.dashBoardData,
                        targetDashboard: this.state.currentDashBoard,
                        targetWidget: widgetID,
                    })
                    //remove visable data?
                    const getDataPayload: tgetFinnHubDataReq = {//fetch fresh data
                        dashboardID: s.dashBoardData[s.currentDashBoard].id,
                        targetDashBoard: s.currentDashBoard,
                        widgetList: [widgetID],
                        finnHubQueue: s.finnHubQueue,
                        rSetUpdateStatus: p.rSetUpdateStatus,
                    }
                    p.tGetFinnhubData(getDataPayload)
                    this.saveDashboard(this.state.currentDashBoard)
                    resolve(true)
                } else { console.log("Problem updating widget filters."); resolve(true) }
            })
        } catch { console.log("Problem updating widget filters."); resolve(true) }
    })
}

//widget config changes how data is manipulated after being queried.
export const updateWidgetConfig = function (widgetID: number, updateObj: config) { //replaces widget config object then saves changes to mongoDB & postgres.
    //config changes used by mongoDB during excel templating.
    // console.log('setting up config', widgetID, updateObj)
    const s: AppState = this.state
    const updatedDashboardData: dashBoardData = produce(s.dashBoardData, (draftState: dashBoardData) => {
        const oldConfig = draftState[s.currentDashBoard].widgetlist[widgetID].config
        draftState[s.currentDashBoard].widgetlist[widgetID].config = { ...oldConfig, ...updateObj }
    })
    const payload: Partial<AppState> = { dashBoardData: updatedDashboardData }
    this.setState(payload, () => {
        if (this.state.enableDrag !== true) {
            this.saveDashboard(this.state.currentDashBoard)
            const updatedWidgetFilters = updatedDashboardData[s.currentDashBoard].widgetlist[widgetID].config
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
    })
}

export const toggleWidgetBody = function (widgetID: string, stateRef: 'menuWidget' | 'stockWidget', dashBoardData: dashBoardData, menuList: menuList, currentDashBoard: string) {
    if (stateRef === 'stockWidget') {
        const updatedWidget: dashBoardData = produce(dashBoardData, (draftState: dashBoardData) => {
            draftState[currentDashBoard].widgetlist[widgetID].showBody = !draftState[currentDashBoard].widgetlist[widgetID].showBody
        })
        return ({ dashBoardData: updatedWidget })
    } else {
        const updatedWidget: menuList = produce(menuList, (draftState: menuList) => {
            draftState[widgetID].showBody = draftState[widgetID].showBody !== undefined ? !draftState[widgetID].showBody : false
        })
        return ({ menuList: updatedWidget })
    }

}