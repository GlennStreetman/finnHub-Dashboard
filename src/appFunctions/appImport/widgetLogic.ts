import produce from "immer"
import { reqBody } from '../../server/routes/mongoDB/setMongoFilters'
import { AppState, AppProps, menuList, widget, dashBoardData, widgetList, stockList, stock, filters, config } from './../../App'
import { rBuildDataModelPayload } from '../../slices/sliceDataModel'


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
        };
    });
    const payload: Partial<AppState> = { menuList: newMenuList }
    this.setState(payload);
}

export const AddNewWidgetContainer = function AddNewWidgetContainer(widgetDescription: string, widgetHeader: string, widgetConfig: string, defaultFilters: Object = {}) {
    //receives info for new widget. Returns updated widgetlist & dashboard data
    // console.log("NEW WIDGET:", widgetDescription, widgetHeader, widgetConfig, defaultFilters)
    const s: AppState = this.state

    const widgetName: number = new Date().getTime();
    const widgetStockList = s.globalStockList
    const newWidget: widget = {
        column: 0,
        columnOrder: -1,
        config: {}, //used to save user setup for the widget that does not require new api request.
        widgetID: widgetName,
        widgetType: widgetDescription,
        widgetHeader: widgetHeader,
        xAxis: 20, //prev 5 rem
        yAxis: 20, //prev 5 rem
        trackedStocks: widgetStockList,
        widgetConfig: widgetConfig, //reference to widget type. Menu or data widget.
        filters: defaultFilters //used to save user setup that requires new api request.
    };

    const newWidgetList: widgetList = produce(s.widgetList, (draftState: widgetList) => {
        draftState[widgetName] = newWidget
    })

    const currentDashBoard: string = s.currentDashBoard
    const newDashBoardData: dashBoardData = produce(s.dashBoardData, (draftState) => {
        draftState[currentDashBoard].widgetlist[widgetName] = newWidget
    })

    const payload: Partial<AppState> = {
        widgetList: newWidgetList,
        dashBoardData: newDashBoardData,
    }
    this.setState(payload, () => {
        this.saveCurrentDashboard(s.currentDashBoard)

        const payload: rBuildDataModelPayload = {
            apiKey: s.apiKey,
            dashBoardData: newDashBoardData
        }
        this.props.rBuildDataModel(payload)
    });

}

export const ChangeWidgetName = function changeWidgetName(stateRef: 'widgetList' | 'menuList', widgetID: string | number, newName: string) {
    const s: AppState = this.state
    const widgetGroup: widgetList | menuList = s[stateRef]
    const newWidgetList: widgetList | menuList = produce(widgetGroup, (draftState) => {
        draftState[widgetID].widgetHeader = newName
    })
    const payload: Partial<AppState> = {
        [stateRef]: newWidgetList,
    }
    this.setState(payload);
}

export const RemoveWidget = function removeWidget(stateRef: 'widgetList' | 'menuList', widgetID: string | number) {
    const s: AppState = this.state
    const widgetGroup: widgetList | menuList = s[stateRef]
    const newWidgetList: widgetList | menuList = produce(widgetGroup, (draftState) => {
        delete draftState[widgetID]
    })
    const payload: Partial<AppState> = {
        [stateRef]: newWidgetList,
    }
    this.setState(payload);
}

export const LockWidgets = function lockWidgets(toggle: number) {
    const payload: Partial<AppState> = { widgetLockDown: toggle }
    this.setState(payload)
}

export const UpdateWidgetFilters = function updateWidgetFilters(widgetID: string, dataKey: string, data: filters) {
    console.log('new filters', dataKey, data)
    try {
        const s: AppState = this.state
        const p: AppProps = this.props
        const newWidgetList: widgetList = produce(s.widgetList, (draftState: widgetList) => {
            draftState[widgetID].filters[dataKey] = data
        })
        const newDashBoardData: dashBoardData = produce(s.dashBoardData, (draftState: dashBoardData) => {
            draftState[s.currentDashBoard].widgetlist[widgetID].filters[dataKey] = data
        })
        const payload: Partial<AppState> = {
            widgetList: newWidgetList,
            dashBoardData: newDashBoardData,
        }
        console.log('update widget filter payload:', payload)
        this.setState(payload, async () => {
            //delete records from mongoDB then rebuild dataset.
            let res = await fetch(`/deleteFinnDashData?widgetID=${widgetID}`)
            if (res.status === 200) {
                console.log('DELETE RECORDS', res)
                const payload: rBuildDataModelPayload = {
                    apiKey: s.apiKey,
                    dashBoardData: newDashBoardData
                }
                p.rBuildDataModel(payload)
            } else { console.log("Problem updating widget filters.") }

        })
    } catch { console.log("Problem updating widget filters.") }
}

export const UpdateWidgetStockList = function updateWidgetStockList(widgetId: number, symbol: string, stockObj: stock | Object = {}) {
    //adds if not present, else removes stock from widget specific stock list.
    const s: AppState = this.state
    if (isNaN(widgetId) === false) {

        const newWidgetList = produce(s.widgetList, (draftState: widgetList) => {
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
                console.log("removing stock", symbol)
                delete trackingSymbolList[symbol]
                draftState[widgetId]["trackedStocks"] = trackingSymbolList
            }
        })

        const updatedDashBoard: dashBoardData = produce(s.dashBoardData, (draftState: dashBoardData) => {
            draftState[s.currentDashBoard].widgetlist = newWidgetList
        })
        const payload: Partial<AppState> = {
            widgetList: newWidgetList,
            dashBoardData: updatedDashBoard,
        }
        this.setState(payload, () => {

            this.saveCurrentDashboard(this.state.currentDashBoard)

            const payload: rBuildDataModelPayload = {
                apiKey: this.state.apiKey,
                dashBoardData: this.state.dashBoardData
            }
            this.props.rBuildDataModel(payload)
        });
    }
}

export const updateWidgetConfig = function (widgetID: number, updateObj: config) {
    const s: AppState = this.state
    const updatedDashboardData: widgetList = produce(s.widgetList, (draftState: widgetList) => {
        for (const x in updateObj) {
            draftState[widgetID].config[x] = updateObj[x]
        }
    })
    const payload: Partial<AppState> = { widgetList: updatedDashboardData }
    this.setState(payload, () => {
        this.saveCurrentDashboard(this.state.currentDashBoard)
        const updatedWidgetFilters = updatedDashboardData[widgetID].config
        const postBody: reqBody = {
            widget: widgetID,
            filters: updatedWidgetFilters,
        }
        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(postBody),
        };
        // console.log("UPDATE OPTIONS", postBody)
        fetch("/updateGQLFilters", options)
            .then((response) => { return response.json() })
            .then(() => {
                console.log('finndash data filters updated in mongoDB.')
            })
    })
}

export const ToggleWidgetVisability = function toggleWidgetVisability() {
    const s: AppState = this.state
    const payload: Partial<AppState> = { showStockWidgets: s.showStockWidgets === 0 ? 1 : 0 }
    this.setState(payload)
}