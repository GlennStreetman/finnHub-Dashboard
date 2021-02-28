export const LoadDashBoard = function loadDashBoard(newGlobalList, newWidgetList) {
    //setup global stock list.
    // console.log("HERE",newGlobalList, newWidgetList)
    let updateGlobalList = newGlobalList;
    for (const stock in updateGlobalList) {      
        updateGlobalList[stock]['dStock'] = function(ex){
            if (ex.length === 1) {
            return (this.symbol)
            } else {
            return (this.key)
            }
        }
    }

    updateGlobalList['sKeys'] = function(){
        const stockList = Object.keys(this)
        const index = stockList.indexOf('sKeys')
        stockList.splice(index,1) 
        return stockList
    }
    //setup widgets, and their individual stock lists.
    let updateWidgetList = newWidgetList;
    for (const widget in updateWidgetList){
        const widgetStockObj = updateWidgetList[widget]
        const trackedStockObj = widgetStockObj.trackedStocks
        for (const stock in trackedStockObj) {
            trackedStockObj[stock]['dStock'] = function(ex){
            if (ex.length === 1) {
                return (this.symbol)
            } else {
                return (this.key)
            }
            }
        }
        if (widgetStockObj.trackedStocks !== null) {
            widgetStockObj.trackedStocks['sKeys'] = function(){
            const stockList = Object.keys(this)
            const index = stockList.indexOf('sKeys')
            stockList.splice(index,1) 
            return stockList
        }
        }
    }

    delete updateWidgetList.null
    this.setState({ 
        globalStockList: updateGlobalList,
        widgetList: updateWidgetList, 
    });
}

export const NewDashboard = function newDashboard(){
    this.state.throttle.resetQueue()
    this.setState({
        currentDashBoard: "",
        globalStockList: [],
        widgetList: {},
        zIndex: [],
    })
}

export const GetSavedDashBoards = async function getSavedDashBoards() {
    let res = await fetch("/dashBoard")
    let data = await res.json()
    
    if (res.status === 200) {
        console.log(200)
        const parseDashBoard = data.savedDashBoards
        for (const dash in parseDashBoard) {
            parseDashBoard[dash].globalstocklist = JSON.parse(parseDashBoard[dash].globalstocklist)
            const thisDash = parseDashBoard[dash].widgetlist
            for (const widget in thisDash) {
                thisDash[widget].filters = JSON.parse(thisDash[widget].filters)
                thisDash[widget].trackedStocks = JSON.parse(thisDash[widget].trackedStocks)
            }
        }
        const loadDash = {
            dashBoardData: parseDashBoard,
            currentDashBoard: data.default,
        }
        const menuList = {}
        for (const menu in data.menuSetup) {
            menuList[menu] = data.menuSetup[menu]
        }
        loadDash['menuList'] = menuList
        // console.log("DONE")
        return (loadDash)

    } else if (res.status === 401) {
        console.log(401)
        return ({dashBoardData: {message: data.message}})
    } else {
        console.log("error", res)
        return [{dashBoardData: {message: data.message}}]
    }
}

export const SaveCurrentDashboard = function saveCurrentDashboard(dashboardName) {
    console.log("saving current dashboard");
    const data = {
        dashBoardName: dashboardName,
        globalStockList: this.state.globalStockList,
        widgetList: this.state.widgetList,
        menuList: this.state.menuList,
    };

    const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };

    fetch("/dashBoard", options)
        .then((data) => console.log('dashboard data retrieved'))
        .then(() => {
            console.log("updating dashboard", data);
            this.getSavedDashBoards();
        });
    // e.preventDefault();
}