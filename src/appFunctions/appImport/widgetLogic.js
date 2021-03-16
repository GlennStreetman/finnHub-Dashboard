import produce from "immer"

export const NewMenuContainer = function newMenuContainer(widgetDescription, widgetHeader, widgetConfig) {
    const widgetName = widgetDescription;
    // this.updateZIndex(widgetName)
    let newMenuList = produce(this.state.menuList, (draftState) => {
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
    this.setState({ menuList: newMenuList });
}

export const AddNewWidgetContainer = function AddNewWidgetContainer(widgetDescription, widgetHeader, widgetConfig, defaultFilters={}) {
    //receives info for new widget. Returns updated widgetlist & dashboard data
    // console.log("NEW WIDGET:", widgetDescription, widgetHeader, widgetConfig, defaultFilters)
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
        // console.log(s.dashBoardData[currentDashBoard])
        draftState[currentDashBoard].widgetlist[widgetName] = newWidget
    })

    //Move to side effects functions?
    this.setState({ 
        widgetList: newWidgetList,
        dashBoardData: newDashBoardData,
    }, ()=>{
        this.saveCurrentDashboard(s.currentDashBoard)
        // console.log('---------NEW DASHBOARD DATA------', s.dashBoardData)
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
    // console.log("REMOVE WIDGET", stateRef, widgetID)
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
    try {
        const s = this.state
        // console.log("UPDATEWIDGETFILTERS", dataKey, data)
        const newWidgetList = produce(s.widgetList, (draftState) => {
            draftState[widgetID].filters[dataKey] = data
        })

        const newDashBoardData = produce(s.dashBoardData, draftState=>{
            draftState[s.currentDashBoard].widgetlist[widgetID].filters[dataKey] = data 
        })
        
        this.setState({
            widgetList: newWidgetList,
            dashBoardData: newDashBoardData,
        }, async ()=>{
            //delete records from mongoDB then rebuild dataset.
            let res = await fetch(`/deleteFinnDashData?widgetID=${widgetID}`)
            let data = await res.json()
            console.log("DATA", data)
            if (res.status === 200) {
                this.props.rBuildDataModel({
                    apiKey: this.state.apiKey,
                    dashBoardData: this.state.dashBoardData
                })
            } else {console.log("Problem updating widget filters.") }

        })
    }catch{console.log("Problem updating widget filters.")}
}

export const UpdateWidgetStockList = function updateWidgetStockList(widgetId, symbol, stockObj={}) {
    //adds if not present, else removes stock from widget specific stock list.
    // console.log(widgetId, symbol, stockObj, 'updating stock list')
    const s = this.state
    const saveCurrent = ()=>{this.saveCurrentDashboard(this.state.currentDashBoard)}
    if (isNaN(widgetId) === false) {

        const newWidgetList = produce(s.widgetList, (draftState) => {
            const trackingSymbolList = draftState[widgetId]["trackedStocks"]; //copy target widgets stock object

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
            draftState[widgetId]["trackedStocks"] = trackingSymbolList;


            } else {
                //remove
                delete trackingSymbolList[symbol]
                draftState[widgetId]["trackedStocks"] = trackingSymbolList
            }

            // draftState.dashBoardData[s.currentDashBoard].widgetlist = updateWidgetStockList 
            })
        
        const updatedDashBoard = produce(s.dashBoardData, draftState=>{
            draftState[s.currentDashBoard].widgetlist = newWidgetList
        })

        this.setState({ 
            widgetList: newWidgetList,
            dashBoardData: updatedDashBoard,
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