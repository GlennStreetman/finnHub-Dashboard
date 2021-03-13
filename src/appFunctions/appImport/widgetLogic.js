import { rBuildDataModel } from "../../slices/sliceDataModel.js";

export const NewMenuContainer = function newMenuContainer(widgetDescription, widgetHeader, widgetConfig) {
    const widgetName = widgetDescription;
    // this.updateZIndex(widgetName)
    let newMenuList = Object.assign({}, this.state.menuList);
    newMenuList[widgetName] = {
        column: 0,
        columnOrder: -1,
        widgetID: widgetName,
        widgetType: widgetDescription,
        widgetHeader: widgetHeader,
        xAxis: "5rem",
        yAxis: "5rem",
        widgetConfig: widgetConfig,
    };
    this.setState({ menuList: newMenuList });
}

export const NewWidgetContainer = function newWidgetContainer(widgetDescription, widgetHeader, widgetConfig) {
    const widgetName = new Date().getTime();
    const s = this.state
    const saveCurrent = ()=>{this.saveCurrentDashboard(s.currentDashBoard)}
    let newWidgetList = Object.assign({}, this.state.widgetList);
    newWidgetList[widgetName] = {
        column: 0,
        columnOrder: -1,
        widgetID: widgetName,
        widgetType: widgetDescription,
        widgetHeader: widgetHeader,
        xAxis: "5rem",
        yAxis: "5rem",
        trackedStocks: s.globalStockList,
        widgetConfig: widgetConfig,
        filters: {}
    };
    const newDashboardData = s.dashBoardData
    newDashboardData[s.currentDashBoard].widgetlist = newWidgetList 
    this.setState({ 
        widgetList: newWidgetList,
        dashBoardData: newDashboardData,
        // rebuildDataSet: 1,
    }, ()=>{
        console.log("-----HERE-------")
        saveCurrent()
        this.props.rBuildDataModel({
            apiKey: this.state.apiKey,
            dashBoardData: this.state.dashBoardData
        })
    }); 

}

export const ChangeWidgetName = function changeWidgetName(stateRef, widgetID, newName) {
    //stateref should equal widgetlist or menulist.
    // console.log(stateRef + ":" + widgetID + ":" + newName);
    let newWidgetList = Object.assign(this.state[stateRef]);
    newWidgetList[widgetID]["widgetHeader"] = newName;
    this.setState({ stateRef: newWidgetList });
}

export const LockWidgets = function lockWidgets(toggle){
    console.log("toggle widget lock")
    this.setState({widgetLockDown: toggle})
}

export const RemoveWidget = function removeWidget(stateRef, widgetID) {
    //stateref should be "widgetList" or "menuList"
    let newWidgetList = Object.assign(this.state[stateRef]);
    delete newWidgetList[widgetID];
    this.setState({ 
        stateRef: newWidgetList, 
    });
}

export const UpdateWidgetFilters = function updateWidgetFilters(widgetID, dataKey, data){
    const updatedWidgetList = {...this.state.widgetList}
    if (updatedWidgetList[widgetID].filters === undefined) {
        updatedWidgetList[widgetID].filters = {}
    }
    updatedWidgetList[widgetID].filters[dataKey] = data
    this.setState({
        widgetList: updatedWidgetList,
    })
}

export const UpdateWidgetStockList = function updateWidgetStockList(widgetId, symbol, stockObj={}) {
    //adds if not present, else removes stock from widget specific stock list.
    // console.log(widgetId, symbol, stockObj, 'updating stock list')
    const s = this.state
    const saveCurrent = ()=>{this.saveCurrentDashboard(this.state.currentDashBoard)}
    if (isNaN(widgetId) === false) {
      let updateWidgetStockList = Object.assign({}, this.state.widgetList); //copy widget list
      const trackingSymbolList = Object.assign({}, updateWidgetStockList[widgetId]["trackedStocks"]); //copy target widgets stock object

        if (Object.keys(trackingSymbolList).indexOf(symbol) === -1) {
        //add
            trackingSymbolList[symbol] = {...stockObj}
            trackingSymbolList[symbol]['dStock'] = function(ex){
                if (ex.length === 1) {
                return (this.symbol)
                } else {
                return (this.key)
                }
            }
        updateWidgetStockList[widgetId]["trackedStocks"] = trackingSymbolList;


    } else {
        //remove
        delete trackingSymbolList[symbol]
        updateWidgetStockList[widgetId]["trackedStocks"] = trackingSymbolList
    }

        const newDashboardData = s.dashBoardData
        newDashboardData[s.currentDashBoard].widgetlist = updateWidgetStockList 
        this.setState({ 
            widgetList: updateWidgetStockList,
            dashBoardData: newDashboardData,
            // rebuildDataSet: 1,
        }, ()=>{
            saveCurrent()
            this.props.rBuildDataModel({
                apiKey: this.state.apiKey,
                dashBoardData: this.state.dashBoardData
            })
        });
    }
}

export const ToggleWidgetVisability = function toggleWidgetVisability(){
    const s = this.state
    this.setState({showStockWidgets: s.showStockWidgets === 0 ? 1 : 0})
}