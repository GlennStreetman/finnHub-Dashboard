import React from "react";
import "./App.css";
import queryString from 'query-string';

//app functions
import {GetStockPrice, LoadStockData}  from "./appFunctions/getStockPrices.js";
import {UpdateTickerSockets, LoadTickerSocket}  from "./appFunctions/socketData.js";
import ThrottleQueue  from "./appFunctions/throttleQueue.js";
  //appImport
  import {Logout, ProcessLogin} from "./appFunctions/appImport/appLogin.js";
  import {NewMenuContainer, NewWidgetContainer, LockWidgets, ToggleWidgetVisability, 
      ChangeWidgetName, RemoveWidget, UpdateWidgetFilters, UpdateWidgetStockList} 
      from "./appFunctions/appImport/widgetLogic.js";
  import {LoadDashBoard, NewDashboard, GetSavedDashBoards, SaveCurrentDashboard} 
      from "./appFunctions/appImport/setupDashoard.js";
  import {SetDrag, MoveWidget, SnapOrder, SnapWidget} from "./appFunctions/appImport/widgetGrid.js";

//component imports
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

      apiFlag: 0, //set to 1 when retrieval of apiKey is needed, 2 if problem with API key.
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
      WatchListMenu: 1, //1 = show, 0 = hide
      widgetCopy: {widgetID: null}, //copy of state of widget being dragged. 
      widgetLockDown: 0, //1 removes buttons from all widgets.
      widgetList: {}, //lists of all widgets.
      zIndex: [], //list widgets. Index location sets zIndex
    };
  
    this.baseState = this.state //used to reset state upon logout.
    //login state logic.
    this.logOut = Logout.bind(this);
    this.processLogin = ProcessLogin.bind(this);

    //app logic for creating/removing, modifying, populating widgets.
    this.newMenuContainer = NewMenuContainer.bind(this);
    this.newWidgetContainer = NewWidgetContainer.bind(this); 
    this.changeWidgetName = ChangeWidgetName.bind(this);
    this.lockWidgets = LockWidgets.bind(this);
    this.removeWidget = RemoveWidget.bind(this);
    this.updateWidgetFilters = UpdateWidgetFilters.bind(this);
    this.updateWidgetStockList = UpdateWidgetStockList.bind(this);
    this.toggleWidgetVisability = ToggleWidgetVisability.bind(this);
    
    //App logic for setting up dashboards.
    this.loadDashBoard = LoadDashBoard.bind(this);
    this.newDashboard = NewDashboard.bind(this);
    this.getSavedDashBoards = GetSavedDashBoards.bind(this);
    this.saveCurrentDashboard = SaveCurrentDashboard.bind(this);

    //app logic for MOVING widgets and snapping them into location.
    this.setDrag = SetDrag.bind(this)
    this.moveWidget = MoveWidget.bind(this);
    this.snapWidget = SnapWidget.bind(this);
    this.snapOrder = SnapOrder.bind(this);
    
    //update and apply state, in module.
    this.updateAPIKey = this.updateAPIKey.bind(this);
    this.updateAPIFlag = this.updateAPIFlag.bind(this); 
    this.updateExchangeList = this.updateExchangeList.bind(this);
    this.updateDefaultExchange = this.updateDefaultExchange.bind(this);
    this.updateGlobalStockList = this.updateGlobalStockList.bind(this); //pass stockRef to delete, pass in stockObj to update.
    this.uploadGlobalStockList = this.uploadGlobalStockList.bind(this); //pass in object to replace global list
    this.syncGlobalStockList = this.syncGlobalStockList.bind(this); //pushes global stock list to all widgets.
    this.toggleBackGroundMenu = this.toggleBackGroundMenu.bind(this);
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

  updateGlobalStockList(event, stockRef, stockObj={}) {
    //pass stockRef to delete, pass in stockObj to update.
    // console.log("update global: ", stockRef, stockObj)
    const s = this.state
    const currentStockObj = {...s.globalStockList}
    if (currentStockObj[stockRef] === undefined) {
      // console.log('updating global list:', stockRef)
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

  updateAPIKey(newKey){
    this.setState({apiKey: newKey})
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
    if (val > 0) {
      this.setState({
        apiFlag: val,
        showStockWidgets: 0,
        backGroundMenu: "about",
      })
    } else {
      this.setState({apiFlag: val})
    }
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
      processLogin={this.processLogin}
      queryData = {quaryData}
      updateExchangeList={this.updateExchangeList}
      updateDefaultExchange={this.updateDefaultExchange}
      throttle={this.state.throttle}
      /> : <></>

      const backGroundSelection = {
        'endPoint': React.createElement(EndPointMenu, endPointProps(this)),
        'manageAccount': React.createElement(AccountMenu, accountMenuProps(this)),
        'about': React.createElement(AboutMenu,{apiFlag: this.state.apiFlag,}),
        'exchangeMenu': React.createElement(ExchangeMenu, exchangeMenuProps(this)),
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
            updateAPIFlag={this.updateAPIFlag}
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
  