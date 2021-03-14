import produce from "immer"

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

export const AddNewWidgetContainer = function AddNewWidgetContainer(widgetDescription, widgetHeader, widgetConfig, defaultFilters={}) {
    //receives info for new widget. Returns updated widgetlist & dashboard data
    console.log("NEW WIDGET:", widgetDescription, widgetHeader, widgetConfig, defaultFilters)
    const s = this.state

    const widgetName = new Date().getTime();
    const newWidget = {
        column: 0,
        columnOrder: -1,
        widgetID: widgetName,
        widgetType: widgetDescription,
        widgetHeader: widgetHeader,
        xAxis: "5rem",
        yAxis: "5rem",
        trackedStocks: s.globalStockList,
        widgetConfig: widgetConfig,
        filters: defaultFilters
    };
    
    const newWidgetList = produce(s.widgetList, (draftState) => {
        draftState[widgetName] = newWidget
    })

    const currentDashBoard = s.currentDashBoard
    const newDashBoardData = produce(s.dashBoardData, (draftState) => {
        console.log(s.dashBoardData[currentDashBoard])
        draftState[currentDashBoard].widgetlist[widgetName] = newWidget
    })

    //Move to side effects functions?
    this.setState({ 
        widgetList: newWidgetList,
        dashBoardData: newDashBoardData,
    }, ()=>{
        this.saveCurrentDashboard(s.currentDashBoard)
        console.log('---------NEW DASHBOARD DATA------', s.dashBoardData)
        this.props.rBuildDataModel({
            apiKey: this.state.apiKey,
            dashBoardData: newDashBoardData
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
    console.log(stateRef, widgetID)
    const s = this.state
    const newWidgetList = produce(s[stateRef], (draftState) => {
        delete draftState[widgetID]
    })
    
    // let newWidgetList = Object.assign(this.state[stateRef]);
    // delete newWidgetList[widgetID];
    this.setState({ 
        [stateRef]: newWidgetList, 
    });
}

export const UpdateWidgetFilters = function updateWidgetFilters(widgetID, dataKey, data){
    const s = this.state
    const newWidgetList = produce(s.widgetList, (draftState) => {
        draftState[widgetID].filters[dataKey] = data
    })
    
    // const updatedWidgetList = {...this.state.widgetList}
    // if (updatedWidgetList[widgetID].filters === undefined) {
    //     updatedWidgetList[widgetID].filters = {}
    // }
    // updatedWidgetList[widgetID].filters[dataKey] = data
    this.setState({
        widgetList: newWidgetList,
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