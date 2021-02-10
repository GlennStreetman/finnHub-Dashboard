import React from "react";
import "./App.css";
import queryString from 'query-string';

//app functions
import {GetStockPrice, LoadStockData}  from "./appFunctions/getStockPrices.js";
import {UpdateTickerSockets, LoadTickerSocket}  from "./appFunctions/socketData.js";
import ThrottleQueue  from "./appFunctions/throttleQueue.js";
 
//components
import TopNav from "./components/topNav.js";
import Login from "./components/login.js";
import AboutMenu from "./components/AboutMenu.js";
import AccountMenu, {accountMenuProps} from "./components/accountMenu.js";
import EndPointMenu, {endPointProps} from "./components/endPoints.js";
import ExchangeMenu, {exchangeMenuProps} from "./components/exchangeMenu.js";
import {WidgetController, MenuWidgetToggle} from "./components/widgetController";

//redux imports
import { connect } from "react-redux";
import { rGetSymbolList } from './slices/sliceExchangeData.js'
import { rUpdateExchangeList } from './slices/sliceExchangeList.js'

class App extends React.Component {
  constructor(props) {
    super(props);

    const defaultGlobalStockList = {}
    defaultGlobalStockList['sKeys'] = function(){
      const stockList = Object.keys(this)
      const index = stockList.indexOf('sKeys')
      stockList.splice(index,1) 
      return stockList
    }

    this.state = {
      // AboutMenu: 0, //1 = show, 0 = hide
      // AccountMenu: 0, //1 = show, 0 = hide
      apiFlag: 0, //set to 1 when retrieval of apiKey is needed
      apiKey: "", //API key retrieved from login database.
      backGroundMenu: '', //reference to none widet info displayed when s.showWidget === 0
      currentDashBoard: "", //dashboard being displayed
      DashBoardMenu: 0, //1 = show, 0 = hide
      dashBoardData: [], //list of all saved dashboards.
      defaultExchange: 'US',
      exchangeList: ['US'], //list of all exchanges activated under account management.
      globalStockList: defaultGlobalStockList, //default stocks for new widgets.
      login: 0, //login state. 0 logged out, 1 logged in. 
      loadStartingDashBoard: 0, //flag switches to 1 after attemping to load default dashboard.
      menuList: {}, //lists of all menu widgets.
      socket: '', //socket connection for streaming stock data.
      showStockWidgets: 1, //0 hide dashboard, 1 show dashboard.
      throttle: ThrottleQueue(25, 1000, true), //all finnhub API requests should be done with finnHub function.
      streamingPriceData: {}, //data shared between some widgets and watchlist menu. Updated by socket data.
      WatchListMenu: 0, //1 = show, 0 = hide
      widgetLockDown: 0, //1 removes buttons from all widgets.
      widgetList: {}, //lists of all widgets.
      zIndex: [], //list widgets. Index location sets zIndex
      widgetCopy: {widgetID: null}, //copy of state of widget being dragged. 
    };
  
    this.baseState = this.state //used to reset state upon logout.
    this.changeWidgetName = this.changeWidgetName.bind(this);
    this.getSavedDashBoards = this.getSavedDashBoards.bind(this);
    this.loadDashBoard = this.loadDashBoard.bind(this);
    this.logOut = this.logOut.bind(this);
    this.lockWidgets = this.lockWidgets.bind(this);
    this.moveWidget = this.moveWidget.bind(this);
    this.newWidgetContainer = this.newWidgetContainer.bind(this); 
    this.newMenuContainer = this.newMenuContainer.bind(this);
    this.newDashboard = this.newDashboard.bind(this);
    this.processLogin = this.processLogin.bind(this);
    this.removeWidget = this.removeWidget.bind(this);
    this.saveCurrentDashboard = this.saveCurrentDashboard.bind(this);
    this.setDrag = this.setDrag.bind(this)
    this.snapWidget = this.snapWidget.bind(this);
    this.snapOrder = this.snapOrder.bind(this);
    this.toggleWidgetVisability = this.toggleWidgetVisability.bind(this);
    this.toggleBackGroundMenu = this.toggleBackGroundMenu.bind(this);
    this.updateWidgetFilters = this.updateWidgetFilters.bind(this);
    this.updateAPIKey = this.updateAPIKey.bind(this);
    this.updateAPIFlag = this.updateAPIFlag.bind(this); 
    this.updateExchangeList = this.updateExchangeList.bind(this);
    this.updateDefaultExchange = this.updateDefaultExchange.bind(this);
    this.updateGlobalStockList = this.updateGlobalStockList.bind(this);
    this.updateWidgetStockList = this.updateWidgetStockList.bind(this);
    this.uploadGlobalStockList = this.uploadGlobalStockList.bind(this);
    this.syncGlobalStockList = this.syncGlobalStockList.bind(this);
  }

  componentDidMount(){
    // this.state.throttle.suspend = Date.now()+2000
    // console.log(Date.now(), this.state.throttle.suspend)
  }

  componentDidUpdate(prevProps, prevState){
    const s = this.state

    if (s.login === 1 && prevState.login === 0) {
      console.log("loggin detected")
      this.getSavedDashBoards()
    };
    
    if (s.globalStockList !== prevState.globalStockList){
      // console.log('updating Stock Data')
      LoadStockData(this, s, GetStockPrice)
      LoadTickerSocket(this, prevState, s.globalStockList, s.socket, s.apiKey, UpdateTickerSockets, s.throttle)
    }

    if (s.login === 1 && s.loadStartingDashBoard === 0 && s.currentDashBoard !== "") {
      // console.log("loading dashboards", s.dashBoardData)
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

  componentWillUnmount(){
    if (this.state.socket !== '') {this.state.socket.close()}
  }

  processLogin(setKey, setLogin, ratelimit) {
    this.setState({ 
      login: setLogin, 
      apiKey: setKey,
      apiRateLimit: ratelimit
    });
  }

  newWidgetContainer(widgetDescription, widgetHeader, widgetConfig) {
    const widgetName = new Date().getTime();
    // this.updateZIndex(widgetName)
    let newWidgetList = Object.assign({}, this.state.widgetList);
    newWidgetList[widgetName] = {
      column: 0,
      columnOrder: -1,
      widgetID: widgetName,
      widgetType: widgetDescription,
      widgetHeader: widgetHeader,
      xAxis: "5rem",
      yAxis: "5rem",
      trackedStocks: this.state.globalStockList,
      widgetConfig: widgetConfig,
      filters: {}
    };
    this.setState({ widgetList: newWidgetList }); 
  }

  newMenuContainer(widgetDescription, widgetHeader, widgetConfig) {
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

  setDrag(stateRef, widgetId, widgetCopy){
    const ref = stateRef === "menuWidget" ? "menuList" : "widgetList";
    let updatedWidgetLocation = Object.assign({}, this.state[ref]);
    updatedWidgetLocation[widgetId]['column'] = 'drag';
    return new Promise((resolve, reject) => {
      this.setState({ ref: updatedWidgetLocation, widgetCopy: widgetCopy }, ()=>{
        resolve(true)
        })
  })}

  moveWidget(stateRef, widgetId, xxAxis, yyAxis, callback=()=>{}) {
    //updates x and y pixel location of target widget.
    //stateref should be "widgetList" or "menuList"
    const widgetListRef = stateRef === "menuWidget" ? "menuList" : "widgetList"
    let updatedWidgetLocation = Object.assign({}, this.state[widgetListRef]);
    updatedWidgetLocation[widgetId]["xAxis"] = xxAxis;
    updatedWidgetLocation[widgetId]["yAxis"] = yyAxis;
    this.setState({ widgetListRef: updatedWidgetLocation }, callback());
  }

  snapOrder(widget, column, yyAxis, wType){
    const s = this.state
    // console.log(widget, column, yyAxis, wType)
    let allWidgets = [...Object.values(s.menuList), ...Object.values(s.widgetList)]
    allWidgets = allWidgets.filter(w => (w['column'] === column ? true : false))
    allWidgets = allWidgets.sort((a,b) => (a.columnOrder > b.columnOrder) ? 1 : -1)

    // console.log("1.Sorted Column", allWidgets)

    let targetLocation = 0
    let foundInsertPoint = false
    let insertionPoint = 0
    let totalHeight = 60
    for (const w in allWidgets) { 
      const h = document.getElementById(allWidgets[w]['widgetID'] + "box").clientHeight
      // console.log("dragHeight:",yyAxis, " ", allWidgets[w].widgetType, totalHeight)
      if (foundInsertPoint === true) {
        allWidgets[w].columnOrder = targetLocation
        targetLocation = targetLocation + 1
      } else if (totalHeight > yyAxis) {
        foundInsertPoint = true
        allWidgets[w].columnOrder = targetLocation + 1
        insertionPoint = targetLocation
        targetLocation = targetLocation + 1
      } else {
        allWidgets[w].columnOrder = targetLocation
        totalHeight = totalHeight + h
        targetLocation = targetLocation + 1
      }
    }

    if (foundInsertPoint === false) {insertionPoint = targetLocation + 1}

    const newMenu = {...s.menuList}
    const newWidget = {...s.widgetList}
    for (const w in allWidgets) {
      if (allWidgets[w]['widgetConfig'] === 'stockWidget') {
        newWidget[allWidgets[w]['widgetID']]['columnOrder'] = allWidgets[w]['columnOrder']
      } else {
        newMenu[allWidgets[w]['widgetID']]['columnOrder'] = allWidgets[w]['columnOrder']
      }
    }
    if (wType === 'stockWidget') {
      newWidget[widget].column = column
      newWidget[widget].columnOrder = insertionPoint
    } else {
      newMenu[widget].column = column  
      newMenu[widget].columnOrder = insertionPoint
    }
    // console.log("4:",newMenu, newWidget)
    this.setState({
      menuList: newMenu, 
      widgetList: newWidget
    })
  }
  // totalHeight = totalHeight + targetColumn[w].height

  snapWidget(stateRef, widgetId, xxAxis, yyAxis){
    //adjust column based upon status of hidden columns
    const s = this.state
    const addColumn = {}
    addColumn[s.menuList.DashBoardMenu.column] = []
    addColumn[s.menuList.WatchListMenu.column] = []
    addColumn[s.menuList.DashBoardMenu.column].push(s.DashBoardMenu)
    addColumn[s.menuList.WatchListMenu.column].push(s.WatchListMenu)
    for (const w in s.widgetList) {
      if (addColumn[s.widgetList[w].column] !== undefined ) {
        addColumn[s.widgetList[w].column].push(1)
      }
    }
    // console.log(addColumn)
    let column = Math.floor(xxAxis / 400)
    for (const x in addColumn) {
      if (addColumn[x].reduce((a,b) => a + b, 0) === 0){
        column = column + 1
      }
    }
    this.snapOrder(widgetId, column, yyAxis, stateRef)
  }

  updateWidgetFilters(widgetID, dataKey, data){
    const updatedWidgetList = {...this.state.widgetList}
    if (updatedWidgetList[widgetID].filters === undefined) {
      updatedWidgetList[widgetID].filters = {}
    }
    updatedWidgetList[widgetID].filters[dataKey] = data
    this.setState({widgetList: updatedWidgetList})
  }
  
  updateWidgetStockList(widgetId, symbol, stockObj={}) {
    //adds if not present, else removes stock from widget specific stock list.
    // console.log(widgetId, symbol, stockObj, 'updating stock list')
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

      // updateWidgetStockList[widgetId]["trackedStocks"] = trackingSymbolList;
      this.setState({ widgetList: updateWidgetStockList });
    }
  }

  updateGlobalStockList(event, stockRef, stockObj={}) {
    //pass stockRef to delete, pass in stockObj to update.
    console.log("update global: ", stockRef, stockObj)
    const s = this.state
    const currentStockObj = {...s.globalStockList}
    if (currentStockObj[stockRef] === undefined) {
      console.log('updating global list:', stockRef)
      currentStockObj[stockRef] = {...stockObj}
      currentStockObj[stockRef]['dStock'] = function(ex){
        //pass in exchange list
        if (ex.length === 1) {
          return (this.symbol)
        } else {
          return (this.key)
        }
      }
      // GetStockPrice(this, stock, s.apiKey, s.throttle);
    } else {
      delete currentStockObj[stockRef]
    }
    this.setState({ globalStockList: currentStockObj });
    event instanceof Event === true && event.preventDefault();
  }

  syncGlobalStockList(){
    const s = this.state
    console.log("syncing stocks")
    const updatedWidgetList = {...s.widgetList}
    for (const w in updatedWidgetList) {
      console.log(updatedWidgetList[w]['widgetHeader'])
      updatedWidgetList[w]['trackedStocks'] = this.state.globalStockList
      console.log(updatedWidgetList[w]['trackedStocks'])
    }
    this.setState({widgetList: updatedWidgetList})
  }

  uploadGlobalStockList(newStockObj){
    this.setState({globalStockList: newStockObj})
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

  getSavedDashBoards() {
    console.log('Getting saved dashboards')
    this.state.throttle.resetQueue()

    fetch("/dashBoard")
      .then((response) => response.json())
      .then((data) => {
        console.log("DASHBOARDDATA",data)
        console.log('Dashboard and menu data retrieved.')
        // let dashboards = data.savedDashBoards;
        // let newList = {}; //replace numeric keys, returned by dataset, with widget IDs.
        // for (const oldKey in dashboards) {
        //   let newKey = dashboards[oldKey]["dashboardname"];
        //   let newData = dashboards[oldKey];
        //   newList[newKey] = newData;
        // }
        // console.log("new Dash Data ", newList)
        const parseDashBoard = data.savedDashBoards
        console.log(parseDashBoard)
        for (const dash in parseDashBoard) {
          parseDashBoard[dash].globalstocklist = JSON.parse(parseDashBoard[dash].globalstocklist)
          const thisDash = parseDashBoard[dash].widgetlist
          for (const widget in thisDash) {
            thisDash[widget].filters = JSON.parse(thisDash[widget].filters)
            thisDash[widget].trackedStocks = JSON.parse(thisDash[widget].trackedStocks)
          }
        }
        console.log(parseDashBoard)
        const loadDash = {
          dashBoardData: parseDashBoard,
          currentDashBoard: data.default,
        }
        if( Object.keys(data.menuSetup).length > 0) {
          const menuList = {}
          for (const menu in data.menuSetup) {
            // console.log(menu, data.menuSetup)
            menuList[menu] = data.menuSetup[menu]
          }
          loadDash['menuList'] = menuList
          // this.setState({ menuList: JSON.parse(data["menuSetup"][0]["menulist"]) });
          }
          console.log("LOADDASH:", loadDash)
          this.setState(loadDash, ()=> {console.log("UPDATED STATE", this.state)})
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
    console.log(updateWidgetList,"---------------")
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
      widgetStockObj.trackedStocks['sKeys'] = function(){
        const stockList = Object.keys(this)
        const index = stockList.indexOf('sKeys')
        stockList.splice(index,1) 
        return stockList
      }
    }

    this.setState({ 
      globalStockList: updateGlobalList,
      widgetList: updateWidgetList, 
    });
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
      widgetList: {},
      zIndex: [],
    })
  }

  updateExchangeList(ex) {
    const p = this.props
    const s = this.state

    if (typeof ex === 'string'){
      const newList = ex.split(',')
    
    for (const stock in newList) {
      // if (p.exchangeList.indexOf(newList[stock]) === -1){
        const newPayload = {
            'exchange': newList[stock],
            'apiKey': s.apiKey,
            'throttle': s.throttle,
        }
        p.rGetSymbolList(newPayload)
      // }
    }

    const payload = {
      'exchangeList': newList,
      'apiKey': this.state.apiKey,
      'finnHub': this.state.finnHub,
    }
    p.rUpdateExchangeList(payload)
    
      this.setState({exchangeList: newList})
    } else {
    this.setState({exchangeList: ex})
    }
  } 

  updateDefaultExchange(ex){
    if (ex.target) {
      this.setState({defaultExchange: ex.target.value})
    } else {
      this.setState({defaultExchange: ex})
    }
  }

  render() {
    // console.log("--------", TopNavContext)
    const menuWidgetToggle = MenuWidgetToggle(this)
    const quaryData = queryString.parse(window.location.search)
    const loginScreen = this.state.login === 0 && this.state.backGroundMenu === '' ? 
      <Login 
      updateLogin={this.processLogin}
      queryData = {quaryData}
      updateExchangeList={this.updateExchangeList}
      updateDefaultExchange={this.updateDefaultExchange}
      throttle={this.state.throttle}
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
            saveCurrentDashboard={this.saveCurrentDashboard}
            getSavedDashBoards={this.getSavedDashBoards}
            dashBoardData={this.state.dashBoardData}
            currentDashBoard={this.state.currentDashBoard}
            changeWidgetName={this.changeWidgetName}
            updateWidgetFilters={this.updateWidgetFilters}
            throttle={this.state.throttle}
            updateAPIKey={this.updateAPIKey}
            zIndex={this.state.zIndex}
            newDashboard={this.newDashboard}
            processLogin={this.processLogin}
            streamingPriceData={this.state.streamingPriceData}
            menuWidgetToggle={menuWidgetToggle}
            WatchListMenu={this.state.WatchListMenu}
            DashBoardMenu={this.state.DashBoardMenu}
            widgetLockDown={this.state.widgetLockDown}
            showStockWidgets={this.state.showStockWidgets}
            exchangeList={this.state.exchangeList}
            defaultExchange={this.state.defaultExchange}
            updateDefaultExchange={this.updateDefaultExchange}
            uploadGlobalStockList={this.uploadGlobalStockList}
            syncGlobalStockList={this.syncGlobalStockList}
            snapWidget={this.snapWidget}
            setDrag={this.setDrag}
            widgetCopy={this.state.widgetCopy}
          />
        {loginScreen}
        {backGroundMenu()}
        
      </>
    ) 
  }
}
const mapStateToProps = state => ({rExchangeList: state.exchangeList.exchangeList})
export default connect(mapStateToProps,{rGetSymbolList, rUpdateExchangeList})(App);
  