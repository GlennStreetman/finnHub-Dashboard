import React from "react";
import "./App.css";
import queryString from 'query-string';

import TopNav from "./components/topNav.js";
import Login from "./components/login.js";
import  ThrottleQueue  from "./appFunctions/throttleQueue.js";

import {WidgetController, MenuWidgetToggle} from "./components/widgetController"
import {GetStockPrice, LoadStockData}  from "./appFunctions/getStockPrices.js";
import {UpdateTickerSockets, LoadTickerSocket}  from "./appFunctions/socketData.js";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      globalStockList: [], //default stocks for new widgets. Viewable through watchlist. Needs to be depricated and replaced with globalStockObject.
      globalStockObject: {},
      widgetList: {}, //lists of all widgets.
      menuList: {}, //lists of all menu widgets.
      login: 0, //login state. 0 logged out, 1 logged in.
      apiKey: "", //API key retrieved from login database.
      refreshStockData: 0, //if set to 1 stock data should be updated from globalStockList
      dashBoardData: [],
      currentDashBoard: "",
      throttle: ThrottleQueue(25, 1000, true), //REMEMBER TO WRAP ALL FINNHUB API CALLS IN: throttle(function() {'YOUR API CALL HERE'})
      apiFlag: 0,
      zIndex: [],
      socket: '',
      trackedStockData: {},
      loadStartingDashBoard: 0, //flag switches to 1 after attemping to load default dashboard.
      DashBoardMenu: 0, //1 = show, 0 = hide
      WatchListMenu: 0, //1 = show, 0 = hide
      AccountMenu: 0, //1 = show, 0 = hide
      AboutMenu: 0, //1 = show, 0 = hide
      widgetLockDown: 0,

    };

    this.baseState = this.state 
    this.updateGlobalStockList = this.updateGlobalStockList.bind(this);
    this.newWidgetContainer = this.newWidgetContainer.bind(this); //move to
    this.newMenuContainer = this.newMenuContainer.bind(this);
    this.removeWidget = this.removeWidget.bind(this);
    this.processLogin = this.processLogin.bind(this);
    this.moveWidget = this.moveWidget.bind(this);
    this.updateWidgetStockList = this.updateWidgetStockList.bind(this);
    this.loadDashBoard = this.loadDashBoard.bind(this);
    this.saveCurrentDashboard = this.saveCurrentDashboard.bind(this);
    this.getSavedDashBoards = this.getSavedDashBoards.bind(this);
    this.changeWidgetName = this.changeWidgetName.bind(this);
    this.updateWidgetData = this.updateWidgetData.bind(this);
    this.updateAPIKey = this.updateAPIKey.bind(this);
    this.updateAPIFlag = this.updateAPIFlag.bind(this); 
    this.updateZIndex = this.updateZIndex.bind(this);
    this.newDashboard = this.newDashboard.bind(this);
    this.logOut = this.logOut.bind(this);
    this.lockWidgets = this.lockWidgets.bind(this);
  }

  componentDidUpdate(prevProps, prevState){
    const s = this.state

    if (s.login === 1 && prevState.login === 0) {this.getSavedDashBoards()};
    LoadStockData(this, s, GetStockPrice)
    LoadTickerSocket(this, prevState, s.globalStockList, s.socket, s.apiKey, UpdateTickerSockets, s.throttle)

    if (s.login === 1 && s.loadStartingDashBoard === 0 && s.currentDashBoard !== "") {
      console.log("loading dashboard")
      this.setState({ loadStartingDashBoard: 1 });
      try {
        let loadWidget = s.dashBoardData[s.currentDashBoard]["widgetlist"];
        let loadGlobal = s.dashBoardData[s.currentDashBoard]["globalstocklist"];
        // console.log(loadWidget, loadGlobal)
        this.loadDashBoard(loadGlobal, loadWidget);
        this.setState({ DashBoardMenu: 1 });
      } catch (err) {
        console.log("failed to load dashboards", err);
      }
    }
  }

  processLogin(setKey, setLogin) {
    this.setState({ login: setLogin });
    this.setState({ apiKey: setKey });
  }

  updateZIndex(widgetName){
    // console.log("Updating zIndex of: " + widgetName)
    let newZ = this.state.zIndex.slice()
    const index = newZ.indexOf(widgetName);
    if (index > -1) {
      // console.log("removing " + widgetName + " from zIndeox.")
      newZ.splice(index, 1);
    }
    newZ.push(widgetName.toString())
    this.setState({zIndex: newZ})
    // console.log(this.state.zIndex)
  }

  newWidgetContainer(widgetDescription, widgetHeader, widgetConfig) {
    const widgetName = new Date().getTime();
    // console.log("adding new widget to zIndex") 
    this.updateZIndex(widgetName)
    let newWidgetList = Object.assign({}, this.state.widgetList);
    newWidgetList[widgetName] = {
      widgetID: widgetName,
      widgetType: widgetDescription,
      widgetHeader: widgetHeader,
      xAxis: "40px",
      yAxis: "40px",
      trackedStocks: this.state.globalStockList,
      widgetConfig: widgetConfig,
    };
    this.setState({ widgetList: newWidgetList }); 
  }

  newMenuContainer(widgetDescription, widgetHeader, widgetConfig) {
    const widgetName = widgetDescription;
    this.updateZIndex(widgetName)
    let newMenuList = Object.assign({}, this.state.menuList);
    newMenuList[widgetName] = {
      widgetID: widgetName,
      widgetType: widgetDescription,
      widgetHeader: widgetHeader,
      xAxis: "40px",
      yAxis: "40px",
      widgetConfig: widgetConfig,
    };
    this.setState({ menuList: newMenuList });
  }

  moveWidget(stateRef, widgetId, xxAxis, yyAxis) {
    //updates x and y pixel location of target widget.
    //stateref should be "widgetList" or "menuList"
    let updatedWidgetLocation = Object.assign({}, this.state[stateRef]);
    updatedWidgetLocation[widgetId]["xAxis"] = xxAxis;
    updatedWidgetLocation[widgetId]["yAxis"] = yyAxis;
    this.setState({ [stateRef]: updatedWidgetLocation });
    this.updateZIndex(widgetId)
  }

  updateWidgetData(widgetID, dataKey, data){
    let updatedWidgetList = Object.assign({}, this.state.widgetList)
    updatedWidgetList[widgetID][dataKey] = data
    this.setState({widgetList: updatedWidgetList})
  }

  updateWidgetStockList(widgetId, symbol) {
    //adds if not present, else removes stock from widget specific stock list.

    if (isNaN(widgetId) === false) {
      let updateWidgetStockList = Object.assign({}, this.state.widgetList);
      const trackingSymbolList = updateWidgetStockList[widgetId]["trackedStocks"].slice();

      if (trackingSymbolList.indexOf(symbol) === -1) {
        updateWidgetStockList[widgetId]["widgetList"] = trackingSymbolList.push(symbol);
      } else {
        updateWidgetStockList[widgetId]["widgetList"] = trackingSymbolList.splice(trackingSymbolList.indexOf(symbol), 1);
      }

      updateWidgetStockList[widgetId]["trackedStocks"] = trackingSymbolList;
      this.setState({ widgetList: updateWidgetStockList });
    }
  }

  changeWidgetName(stateRef, widgetID, newName) {
    //stateref should equal widgetlist or menulist.
    // console.log(stateRef + ":" + widgetID + ":" + newName);
    let newWidgetList = Object.assign(this.state[stateRef]);
    newWidgetList[widgetID]["widgetHeader"] = newName;
    this.setState({ stateRef: newWidgetList });
  }

  removeWidget(stateRef, widgetID) {
    //stateref should be "widgetList" or "menuList"
    let newWidgetList = Object.assign(this.state[stateRef]);
    delete newWidgetList[widgetID];
    this.setState({ stateRef: newWidgetList });
  }

  updateGlobalStockList(event, stock, stockObject) {
    // Adds stock to global tracking list.
    let addStockId = stock;
    if (stock.indexOf(":") > 0) {
      addStockId = stock.slice(0, stock.indexOf(":"));
    }
    var currentStockList = Array.from(this.state.globalStockList);
    if (currentStockList.includes(addStockId) === false) {
      currentStockList.push(addStockId);
    } else {
      currentStockList.splice(currentStockList.indexOf(addStockId), 1);
    }
    this.setState({ globalStockList: currentStockList });

    if (this.state.globalStockObject[stock] === undefined ) {
      let updatedStockList = Object.assign(this.state.globalStockObject)
      updatedStockList[stock] = stockObject
      this.setState({globalStockObject: updatedStockList})
    } else {
      let updatedStockList = Object.assign(this.state.globalStockObject)
      delete updatedStockList[stock]
      this.setState({globalStockObject: updatedStockList})
    }
    event.preventDefault();
  }

  getSavedDashBoards() {
    console.log('getting saved dashboards')
    this.state.throttle.resetQueue()

    fetch("/dashBoard")
      .then((response) => response.json())
      .then((data) => {
        console.log('dashboard and menu data retrieved')
        // console.log(data)
        let dashboards = data.savedDashBoards;
        let newList = {}; //replace numeric keys, returned by dataset, with widget IDs.
        for (const oldKey in dashboards) {
          let newKey = dashboards[oldKey]["dashboardname"];
          let newData = dashboards[oldKey];
          newList[newKey] = newData;
        }
        console.log("new Dash Data ", newList)
        this.setState({ dashBoardData: newList });
        if( data.menuSetup[0] !== undefined) {
          this.setState({ menuList: JSON.parse(data["menuSetup"][0]["menulist"]) });
          this.setState({ currentDashBoard: data["menuSetup"][0]["defaultmenu"] });
        }
        //show about menu by default if login does not return API key.
        if (this.state.apiKey === '' && this.state.apiFlag === 0) {
          console.log("changing api flag")
          this.setState({apiFlag: 1})
        }
      })
      .catch((error) => {
        console.error("Failed to recover dashboards", error);
      });
  }

  loadDashBoard(newGlobalList, newWidgetList) {
    let updateGlobalList = JSON.parse(newGlobalList);
    let updateWidgetList = JSON.parse(newWidgetList);
    this.setState({ globalStockList: updateGlobalList });
    this.setState({ widgetList: updateWidgetList });
    this.setState({ refreshStockData: 1 });
  }

  saveCurrentDashboard(dashboardName) {
    // console.log("updating dashboard");
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
        // console.log("updating dashboard");
        this.getSavedDashBoards();
      });
    // e.preventDefault();
  }

  updateAPIKey(newKey){
    this.setState({apiKey: newKey})
  }

  lockWidgets(toggle){
    console.log("toggle widget lock")
    this.setState({widgetLockDown: toggle})
  }

  updateAPIFlag(val){
    this.setState({apiFlag: val})
  }

  logOut(){
    fetch("/logOut")
    .then((data) => console.log('logging out'))
    .then(() => {
      console.log("reseting state")
      this.setState(this.baseState)
    });
  }

  newDashboard(){
    this.state.throttle.resetQueue()
    this.setState({
      currentDashBoard: "",
      globalStockList: [],
      // globalStockObject: [],
      widgetList: {},
      zIndex: [],
    })
  }

  render() {
    
    const menuWidgetToggle = MenuWidgetToggle(this)
    const quaryData = queryString.parse(window.location.search)
    const loginScreen = this.state.login === 0 ? 
      <Login 
      updateLogin={this.processLogin}
      queryData = {quaryData}
      /> : <></>

    return (
      <>
        <TopNav
          apiFlag={this.state.apiFlag}
          login={this.state.login}
          logOut={this.logOut}            
          newWidgetContainer={this.newWidgetContainer}
          newMenuContainer={this.newMenuContainer}            
          menuList={this.state.menuList}
          updateAPIFlag={this.updateAPIFlag}
          menuWidgetToggle={menuWidgetToggle}
          WatchListMenu={this.state.WatchListMenu}
          AccountMenu={this.state.AccountMenu}
          AboutMenu={this.state.AboutMenu}
          DashBoardMenu={this.state.DashBoardMenu}
          lockWidgets={this.lockWidgets}
          widgetLockDown={this.state.widgetLockDown}
        />
        <WidgetController
          login={this.state.login}
          menuList={this.state.menuList}
          availableStocks={this.state.availableStocks}
          globalStockList={this.state.globalStockList}
          widgetList={this.state.widgetList}
          updateGlobalStockList={this.updateGlobalStockList}
          moveWidget={this.moveWidget}
          removeWidget={this.removeWidget}
          apiKey={this.state.apiKey}
          updateWidgetStockList={this.updateWidgetStockList}
          loadDashBoard={this.loadDashBoard}
          refreshStockData={this.state.refreshStockData}
          toggleRefreshStockData={this.toggleRefreshStockData}
          saveCurrentDashboard={this.saveCurrentDashboard}
          getSavedDashBoards={this.getSavedDashBoards}
          dashBoardData={this.state.dashBoardData}
          currentDashBoard={this.state.currentDashBoard}
          changeWidgetName={this.changeWidgetName}
          updateWidgetData={this.updateWidgetData}
          throttle={this.state.throttle}
          updateAPIKey={this.updateAPIKey}
          zIndex={this.state.zIndex}
          updateZIndex={this.updateZIndex}
          newDashboard={this.newDashboard}
          processLogin={this.processLogin}
          trackedStockData={this.state.trackedStockData}
          menuWidgetToggle={menuWidgetToggle}
          WatchListMenu={this.state.WatchListMenu}
          AccountMenu={this.state.AccountMenu}
          AboutMenu={this.state.AboutMenu}
          DashBoardMenu={this.state.DashBoardMenu}
          widgetLockDown={this.state.widgetLockDown}
        />
        {loginScreen}

      </>
    ) 
  }
}

export default App;
