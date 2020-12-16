import React from "react";
import "./App.css";
import queryString from 'query-string';

import {GetStockPrice, LoadStockData}  from "./appFunctions/getStockPrices.js";
import {UpdateTickerSockets, LoadTickerSocket}  from "./appFunctions/socketData.js";
import ThrottleQueue  from "./appFunctions/throttleQueue.js";

import TopNav from "./components/topNav.js";
import Login from "./components/login.js";
import AboutMenu from "./components/AboutMenu.js";
import AccountMenu, {accountMenuProps} from "./components/accountMenu.js";
import EndPointMenu, {endPointProps} from "./components/endPoints.js";
import ExchangeMenu, {exchangeMenuProps} from "./components/exchangeMenu.js";

import {WidgetController, MenuWidgetToggle} from "./components/widgetController";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      AboutMenu: 0, //1 = show, 0 = hide
      AccountMenu: 0, //1 = show, 0 = hide
      apiFlag: 0, //set to 1 when retrieval of apiKey is needed
      apiKey: "", //API key retrieved from login database.
      backGroundMenu: '', //reference to none widet info displayed when s.showWidget === 0
      currentDashBoard: "", //dashboard being displayed
      DashBoardMenu: 0, //1 = show, 0 = hide
      dashBoardData: [], //list of all saved dashboards.
      exchangeList: ['US'], //list of all exchanges activated under account management.
      globalStockList: [], //default stocks for new widgets.
      login: 0, //login state. 0 logged out, 1 logged in. 
      loadStartingDashBoard: 0, //flag switches to 1 after attemping to load default dashboard.
      menuList: {}, //lists of all menu widgets.
      refreshStockData: 0, //if set to 1 stock data should be updated from globalStockList
      socket: '', //socket connection for streaming stock data.
      showStockWidgets: 1, //0 hide dashboard, 1 show dashboard.
      throttle: ThrottleQueue(25, 1000, true), //all finnhub API requests should be done with finnHub function.
      trackedStockData: {}, //data shared between some widgets and watchlist menu. Updated by socket data.
      WatchListMenu: 0, //1 = show, 0 = hide
      widgetLockDown: 0, //1 removes buttons from all widgets.
      widgetList: {}, //lists of all widgets.
      zIndex: [], //list widgets. Index location sets zIndex
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
    this.updateWidgetFilters = this.updateWidgetFilters.bind(this);
    this.updateAPIKey = this.updateAPIKey.bind(this);
    this.updateAPIFlag = this.updateAPIFlag.bind(this); 
    this.updateZIndex = this.updateZIndex.bind(this);
    this.newDashboard = this.newDashboard.bind(this);
    this.logOut = this.logOut.bind(this);
    this.lockWidgets = this.lockWidgets.bind(this);
    this.toggleWidgetVisability = this.toggleWidgetVisability.bind(this);
    this.toggleBackGroundMenu = this.toggleBackGroundMenu.bind(this);
    this.updateExchangeList = this.updateExchangeList.bind(this);
  }

  componentDidUpdate(prevProps, prevState){
    const s = this.state

    if (s.login === 1 && prevState.login === 0) {
      console.log("loggin detected")
      this.getSavedDashBoards()
    };
    
    if (s.globalStockList !== prevState.globalStockList){
      LoadStockData(this, s, GetStockPrice)
      LoadTickerSocket(this, prevState, s.globalStockList, s.socket, s.apiKey, UpdateTickerSockets, s.throttle)
    }

    if (s.login === 1 && s.loadStartingDashBoard === 0 && s.currentDashBoard !== "") {
      console.log("loading dashboards", s.dashBoardData)
      this.setState({ loadStartingDashBoard: 1 });
      try {
        if (Object.keys(s.dashBoardData).length > 0){
          let loadWidget = s.dashBoardData[s.currentDashBoard]["widgetlist"];
          let loadGlobal = s.dashBoardData[s.currentDashBoard]["globalstocklist"];
          // console.log(loadWidget, loadGlobal)
          this.loadDashBoard(loadGlobal, loadWidget);
          this.setState({ DashBoardMenu: 1 });
        }
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
      filters: {}
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

  updateWidgetFilters(widgetID, dataKey, data){
    let updatedWidgetList = Object.assign({}, this.state.widgetList)
    // updatedWidgetList[widgetID][dataKey] = data
    if (updatedWidgetList[widgetID].filters === undefined) {
      updatedWidgetList[widgetID].filters = {}
    }
    updatedWidgetList[widgetID].filters[dataKey] = data
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
   
  // updateGlobalStockList(event, stock, stockObject) {
  updateGlobalStockList(event, stock) {

    // Adds stock to global tracking list.
    GetStockPrice(this, stock, this.state.apiKey, this.state.throttle)
    let addStockId = stock;
    console.log("globalNew", addStockId)
    if (stock.indexOf(":") > 0) {
      addStockId = stock.slice(0, stock.indexOf(":"));
    }
    const currentStockList = Array.from(this.state.globalStockList);
    if (currentStockList.includes(addStockId) === false) {
      currentStockList.push(addStockId);
    } else {
      currentStockList.splice(currentStockList.indexOf(addStockId), 1);
    }
    this.setState({ globalStockList: currentStockList });

    event instanceof Event === true && event.preventDefault();
  }

  getSavedDashBoards() {
    console.log('Getting saved dashboards')
    this.state.throttle.resetQueue()

    fetch("/dashBoard")
      .then((response) => response.json())
      .then((data) => {
        console.log('Dashboard and menu data retrieved.')
        // console.log(data)
        let dashboards = data.savedDashBoards;
        let newList = {}; //replace numeric keys, returned by dataset, with widget IDs.
        for (const oldKey in dashboards) {
          let newKey = dashboards[oldKey]["dashboardname"];
          let newData = dashboards[oldKey];
          newList[newKey] = newData;
        }
        // console.log("new Dash Data ", newList)
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

  toggleWidgetVisability(){
    const s = this.state
    this.setState({showStockWidgets: s.showStockWidgets === 0 ? 1 : 0})
  }

  toggleBackGroundMenu(menu){
    if (menu === '') {
      this.setState({backGroundMenu: menu})
      this.setState({showStockWidgets: 1})
    } else if (this.state.backGroundMenu !== menu) {
      this.setState({backGroundMenu: menu})
      this.setState({showStockWidgets: 0})
    } else {
      this.setState({backGroundMenu: ""})
      this.setState({showStockWidgets: 1})
    }
  }

  updateAPIFlag(val){
    this.setState({apiFlag: val})
  }

  logOut(){
    fetch("/logOut")
    .then((data) => console.log('logging out', data))
    .then(() => {
      setTimeout(() => this.setState(this.baseState),100)
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

  updateExchangeList(ex) {
    const s = this.state
    const newExchangeList = [...s.exchangeList]
    if (s.exchangeList.indexOf(ex) >= 0) {
      newExchangeList.splice(s.exchangeList.indexOf(ex),1)
    } else {
      newExchangeList.push(ex)
    }
    this.setState({exchangeList: newExchangeList})
  } 

  render() {
    // console.log("--------", TopNavContext)
    const menuWidgetToggle = MenuWidgetToggle(this)
    const quaryData = queryString.parse(window.location.search)
    const loginScreen = this.state.login === 0 && this.state.backGroundMenu === '' ? 
      <Login 
      updateLogin={this.processLogin}
      queryData = {quaryData}
      /> : <></>

      const backGroundSelection = {
        'endPoint': React.createElement(EndPointMenu, endPointProps(this)),
        'manageAccount': React.createElement(AccountMenu, accountMenuProps(this)),
        'about': <AboutMenu />,
        'exchangeMenu': React.createElement(ExchangeMenu, exchangeMenuProps(this))
      }
      
      const backGroundMenu = () => {
        return (
          <div className='backgroundMenu'>
            {backGroundSelection[this.state.backGroundMenu]}
          </div>
        )
      }

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
            toggleWidgetVisability={this.toggleWidgetVisability}
            showStockWidgets={this.state.showStockWidgets}
            toggleBackGroundMenu={this.toggleBackGroundMenu}
            backGroundMenu={this.state.backGroundMenu}
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
            updateWidgetFilters={this.updateWidgetFilters}
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
            showStockWidgets={this.state.showStockWidgets}
          />
        {loginScreen}
        {backGroundMenu()}
        
      </>
    ) 
  }
}

export default App;
  