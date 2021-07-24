import produce from "immer"
import { reqBody } from '../../server/routes/mongoDB/setMongoConfig'
import { AppState, AppProps, menuList, widget, dashBoardData, widgetList, stockList, stock, filters, config } from './../../App'
import { rBuildDataModelPayload, rebuildTargetWidgetPayload } from '../../slices/sliceDataModel'
import { tgetFinnHubDataReq } from './../../thunks/thunkFetchFinnhub'

export const NewMenuContainer = function newMenuContainer(widgetDescription: string, widgetHeader: string, widgetConfig: string) {
    const s: AppState = this.state
    const widgetName = widgetDescription;
    const menuList: menuList = s.menuList
    let newMenuList = produce(menuList, (draftState: menuList) => {
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
    const payload: Partial<AppState> = { menuList: newMenuList }
    this.setState(payload);
}

export const AddNewWidgetContainer = function AddNewWidgetContainer(widgetDescription: string, widgetHeader: string, widgetConfig: string, defaultFilters: Object = {}) {
    //receives info for new widget. Returns updated widgetlist & dashboard data
    // console.log("NEW WIDGET:", widgetDescription, widgetHeader, widgetConfig, defaultFilters)
    const s: AppState = this.state
    const currentDashboard = s.currentDashBoard
    const widgetName: string = new Date().getTime().toString();
    const widgetStockList = s.globalStockList
    const newWidget: widget = {
        column: 1,
        columnOrder: -1,
        config: {}, //used to save user setup for the widget that does not require new api request.
        filters: defaultFilters, //used to save user setup that requires new api request.
        showBody: true,
        trackedStocks: widgetStockList,
        widgetID: widgetName,
        widgetType: widgetDescription,
        widgetHeader: widgetHeader,
        widgetConfig: widgetConfig, //reference to widget type. Menu or data widget.
        xAxis: 20, //prev 5 rem
        yAxis: 20, //prev 5 rem
    };

    const currentDashBoard: string = s.currentDashBoard
    const newDashBoardData: dashBoardData = produce(s.dashBoardData, (draftState) => {
        draftState[currentDashBoard].widgetlist[widgetName] = newWidget
    })

    const payload: Partial<AppState> = {
        // widgetList: newWidgetList,
        dashBoardData: newDashBoardData,
    }
    this.setState(payload, () => {
        this.saveDashboard(s.currentDashBoard)
        // let completeFunction = function () {
        //     return new Promise((res) => { res(true) })
        // }
        const payload: rebuildTargetWidgetPayload = {
            apiKey: s.apiKey,
            dashBoardData: newDashBoardData,
            targetDashboard: currentDashboard,
            targetWidget: `${widgetName}`,
        }
        this.props.rRebuildTargetWidgetModel(payload)
        let updatePayload: tgetFinnHubDataReq = {
            targetDashBoard: currentDashboard,
            widgetList: [`${widgetName}`],
            finnHubQueue: s.finnHubQueue,
            rSetUpdateStatus: this.props.rSetUpdateStatus,
        }
        this.props.tGetFinnhubData(updatePayload)
    });


}

export const ChangeWidgetName = function (stateRef: 'widgetList' | 'menuList', widgetID: string | number, newName: string) {
    // console.log(stateRef, widgetID, newName)
    if (stateRef === 'menuList') {
        const s: AppState = this.state
        const widgetGroup: menuList = s[stateRef]
        const newWidgetList: menuList = produce(widgetGroup, (draftState) => {
            draftState[widgetID].widgetHeader = newName
        })
        const payload: Partial<AppState> = {
            [stateRef]: newWidgetList,
        }
        this.setState(payload);
    } else {
        const s: AppState = this.state
        const widgetGroup: widgetList = s.dashBoardData[s.currentDashBoard].widgetlist
        const newWidgetList: widgetList | menuList = produce(widgetGroup, (draftState) => {
            draftState[widgetID].widgetHeader = newName
        })
        const newDashboardData: dashBoardData = produce(s.dashBoardData, (draftState) => {
            draftState[s.currentDashBoard].widgetlist = newWidgetList
        })
        const payload: Partial<AppState> = {
            'dashBoardData': newDashboardData,
        }
        this.setState(payload);
    }
}

export const RemoveWidget = async function (stateRef: 'widgetList' | 'menuList', widgetID: string | number) {

    const widgetGroup: widgetList | menuList = this.state[stateRef]
    const newWidgetList: widgetList | menuList = produce(widgetGroup, (draftState) => {
        delete draftState[widgetID]
    })

    let dashBoardData: dashBoardData = this.state.dashBoardData
    const newDashboardData: dashBoardData = produce(dashBoardData, (draftState) => {
        let thisWidgetList = draftState[this.state.currentDashBoard].widgetlist
        delete thisWidgetList[widgetID]
    })

    const payload: Partial<AppState> = {
        [stateRef]: newWidgetList,
        dashBoardData: newDashboardData,
    }
    this.setState(payload, () => {
        this.saveDashboard(this.state.currentDashBoard)
        return true
    });
    // this.rebuildDashboardState()

}

export const LockWidgets = function (toggle: number) {
    const payload: Partial<AppState> = { widgetLockDown: toggle }
    this.setState(payload)
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
export const UpdateWidgetFilters = function (widgetID: string, data: filters) {

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
        // console.log('update widget filter payload:', payload)
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
                const getDataPayload = {//fetch fresh data
                    targetDashBoard: s.currentDashBoard,
                    widgetList: [widgetID],
                    finnHubQueue: s.finnHubQueue,
                    rSetUpdateStatus: p.rSetUpdateStatus,
                }
                p.tGetFinnhubData(getDataPayload)
                this.saveDashboard(this.state.currentDashBoard)

            } else { console.log("Problem updating widget filters.") }
        })
    } catch { console.log("Problem updating widget filters.") }
}

//widget config changes how data is manipulated after being queried.
export const updateWidgetConfig = function (widgetID: number, updateObj: config) { //replaces widget config object then saves changes to mongoDB & postgres.
    //config changes used by mongoDB during excel templating.
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

export const setWidgetFocus = function (newFocus: string) {
    const s: AppState = this.state
    const updatedDashboardData: dashBoardData = produce(s.dashBoardData, (draftState: dashBoardData) => {
        const wList = draftState[s.currentDashBoard].widgetlist
        for (const x in wList) {
            const widget = wList[x]
            if (widget.trackedStocks[newFocus]) widget.config['targetSecurity'] = newFocus
        }
    })
    const payload: Partial<AppState> = { dashBoardData: updatedDashboardData }
    this.setState(payload)
}

export const ToggleWidgetVisability = function toggleWidgetVisability() {
    const s: AppState = this.state
    const payload: Partial<AppState> = { showStockWidgets: s.showStockWidgets === 0 ? 1 : 0 }
    this.setState(payload)
}

export const toggleWidgetBody = function (widgetID: string, stateRef: 'menuWidget' | 'stockWidget') {
    const s: AppState = this.state
    console.log(widgetID, stateRef)
    if (stateRef === 'stockWidget') {
        const updatedWidget: dashBoardData = produce(s.dashBoardData, (draftState: dashBoardData) => {
            draftState[s.currentDashBoard].widgetlist[widgetID].showBody = !draftState[s.currentDashBoard].widgetlist[widgetID].showBody
        })
        this.setState({ dashBoardData: updatedWidget })
    } else {
        const updatedWidget: menuList = produce(s.menuList, (draftState: menuList) => {
            draftState[widgetID].showBody = draftState[widgetID].showBody !== undefined ? !draftState[widgetID].showBody : false
        })
        console.log()
        this.setState({ menuList: updatedWidget })
    }

}

export const removeDashboardFromState = function (widgetName) {
    const s: AppState = this.state
    const updatedWidget: dashBoardData = produce(s.dashBoardData, (draftState: dashBoardData) => {
        delete draftState[widgetName]
    })
    this.setState({ dashBoardData: updatedWidget })

}