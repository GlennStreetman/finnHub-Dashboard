import produce from "immer"
import { reqBody } from '../../server/routes/mongoDB/setMongoFilters'
import { AppState, AppProps, menuList, widget, dashBoardData, widgetList } from './../../App'
import { rBuildDataModelPayload } from '../../slices/sliceDataModel'

export const NewMenuContainer = function newMenuContainer(this, widgetDescription: string, widgetHeader: string, widgetConfig: string) {
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

export const AddNewWidgetContainer = function AddNewWidgetContainer(this, widgetDescription: string, widgetHeader: string, widgetConfig: string, defaultFilters: Object = {}) {
    //receives info for new widget. Returns updated widgetlist & dashboard data
    // console.log("NEW WIDGET:", widgetDescription, widgetHeader, widgetConfig, defaultFilters)
    const s: AppState = this.state

    const widgetName = new Date().getTime();
    const widgetStockList = s.globalStockList
    const newWidget: widget = {
        column: 0,
        columnOrder: -1,
        config: {}, //used to save user setup for the widget that does not require new api request.
        widgetID: widgetName,
        widgetType: widgetDescription,
        widgetHeader: widgetHeader,
        xAxis: "5rem",
        yAxis: "5rem",
        trackedStocks: widgetStockList,
        widgetConfig: widgetConfig, //reference to widget type. Menu or data widget.
        filters: defaultFilters //used to save user setup that requires new api request.
    };

    const newWidgetList: widgetList = produce(s.widgetList, (draftState: Partial<AppState>) => {
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

export const ChangeWidgetName = function changeWidgetName(this, stateRef: string, widgetID: string | number, newName: string) {
    //state ref should be 'widgetList' or 'menuList'
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

export const RemoveWidget = function removeWidget(this, stateRef: string, widgetID: string | number) {
    //state ref should be 'widgetList' or 'menuList'
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

export const LockWidgets = function lockWidgets(this, toggle) {
    const payload: Partial<AppState> = { widgetLockDown: toggle }
    this.setState(payload)
}

export const UpdateWidgetFilters = function updateWidgetFilters(this, widgetID, dataKey, data) {
    try {
        const s = this.state
        const newWidgetList = produce(s.widgetList, (draftState) => {
            draftState[widgetID].filters[dataKey] = data
        })
        const newDashBoardData = produce(s.dashBoardData, draftState => {
            draftState[s.currentDashBoard].widgetlist[widgetID].filters[dataKey] = data
        })
        this.setState({
            widgetList: newWidgetList,
            dashBoardData: newDashBoardData,
        }, async () => {
            //delete records from mongoDB then rebuild dataset.
            let res = await fetch(`/deleteFinnDashData?widgetID=${widgetID}`)
            let data = await res.json()
            console.log("DATA", data)
            if (res.status === 200) {
                this.props.rBuildDataModel({
                    apiKey: this.state.apiKey,
                    dashBoardData: this.state.dashBoardData
                })
            } else { console.log("Problem updating widget filters.") }

        })
    } catch { console.log("Problem updating widget filters.") }
}

export const UpdateWidgetStockList = function updateWidgetStockList(this, widgetId, symbol, stockObj = {}) {
    //adds if not present, else removes stock from widget specific stock list.
    // console.log(widgetId, symbol, stockObj, 'updating stock list')
    const s = this.state
    // const saveCurrent = ()=>{this.saveCurrentDashboard(this.state.currentDashBoard)}
    if (isNaN(widgetId) === false) {

        const newWidgetList = produce(s.widgetList, (draftState) => {
            const trackingSymbolList = draftState[widgetId]["trackedStocks"]; //copy target widgets stock object

            if (Object.keys(trackingSymbolList).indexOf(symbol) === -1) {
                //add
                trackingSymbolList[symbol] = { ...stockObj }
                trackingSymbolList[symbol]['dStock'] = function (ex) {
                    if (ex.length === 1) {
                        return (this.symbol)
                    } else {
                        return (this.key)
                    }
                }
                draftState[widgetId]["trackedStocks"] = trackingSymbolList;


            } else {
                //remove
                console.log("removing stock", symbol)
                delete trackingSymbolList[symbol]
                draftState[widgetId]["trackedStocks"] = trackingSymbolList
            }

            // draftState.dashBoardData[s.currentDashBoard].widgetlist = updateWidgetStockList 
        })

        const updatedDashBoard = produce(s.dashBoardData, draftState => {
            draftState[s.currentDashBoard].widgetlist = newWidgetList
        })

        this.setState({
            widgetList: newWidgetList,
            dashBoardData: updatedDashBoard,
            // rebuildDataSet: 1,
        }, () => {
            this.saveCurrentDashboard(this.state.currentDashBoard)
            this.props.rBuildDataModel({
                apiKey: this.state.apiKey,
                dashBoardData: this.state.dashBoardData
            })
        });
    }
}

export const updateWidgetConfig = function (this, widgetID: number, updateObj: Object) {
    //receives key and value to update in widget config object.
    // console.log("UPDATING CONFIG", widgetID, updateObj)
    // const s = this.state
    const updatedDashboardData = produce(this.state.widgetList, (draftState) => {
        for (const x in updateObj) {
            draftState[widgetID].config[x] = updateObj[x]
        }
    })
    // console.log('updatedDashboardData', updatedDashboardData)
    this.setState({ widgetList: updatedDashboardData }, () => {
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

export const ToggleWidgetVisability = function toggleWidgetVisability(this) {
    const s = this.state
    this.setState({ showStockWidgets: s.showStockWidgets === 0 ? 1 : 0 })
}