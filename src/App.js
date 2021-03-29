import React from "react";
import "./App.css";
import queryString from "query-string";
import produce from "immer"
//app functions
import { GetStockPrice, LoadStockData } from "./appFunctions/getStockPrices";
import { UpdateTickerSockets, LoadTickerSocket } from "./appFunctions/socketData";
// import ThrottleQueue from "./appFunctions/throttleQueue";
//appImport
import { Logout, ProcessLogin } from "./appFunctions/appImport/appLogin";
import {
  NewMenuContainer, AddNewWidgetContainer, LockWidgets,
  ToggleWidgetVisability, ChangeWidgetName, RemoveWidget,
  UpdateWidgetFilters,UpdateWidgetStockList, updateWidgetConfig
} from "./appFunctions/appImport/widgetLogic";
import { LoadDashBoard, NewDashboard, GetSavedDashBoards, SaveCurrentDashboard } 
  from "./appFunctions/appImport/setupDashboard";
import { SetDrag, MoveWidget, SnapOrder, SnapWidget } from "./appFunctions/appImport/widgetGrid";

//component imports
import TopNav from "./components/topNav";
import Login from "./components/login";
import AboutMenu from "./components/AboutMenu";
import AccountMenu, { accountMenuProps } from "./components/accountMenu";
import EndPointMenu, { endPointProps } from "./components/endPoints";
import ExchangeMenu, { exchangeMenuProps } from "./components/exchangeMenu";
import { WidgetController, MenuWidgetToggle } from "./components/widgetController";

//redux imports
import { connect } from "react-redux";
import { tGetSymbolList } from "./slices/sliceExchangeData";
import { rUpdateExchangeList } from "./slices/sliceExchangeList";
import { rBuildDataModel, rResetUpdateFlag } from "./slices/sliceDataModel";
import { tGetFinnhubData } from "./thunks/thunkFetchFinnhub";
import { tGetMongoDB } from "./thunks/thunkGetMongoDB";

class App extends React.Component {
  constructor(props) {
    super(props);

    const defaultGlobalStockList = {};

    this.state = {
      apiFlag: 0, //set to 1 when retrieval of apiKey is needed, 2 if problem with API key.
      apiKey: "", //API key retrieved from login database.
      backGroundMenu: "", //reference to none widet info displayed when s.showWidget === 0
      currentDashBoard: "", //dashboard being displayed
      DashBoardMenu: 0, //1 = show, 0 = hide
      dashBoardData: [], //list of all saved dashboards.
      defaultExchange: "US",
      exchangeList: ["US"], //list of all exchanges activated under account management.
      globalStockList: defaultGlobalStockList, //default stocks for new widgets.
      login: 0, //login state. 0 logged out, 1 logged in.
      loadStartingDashBoard: 0, //flag switches to 1 after attemping to load default dashboard.
      menuList: {}, //lists of all menu widgets.
      rebuildDataSet: 0, //Set to 1 to trigger finnHub Dataset rebuild. 
      enableDrag: false,
      socket: "", //socket connection for streaming stock data.
      showStockWidgets: 1, //0 hide dashboard, 1 show dashboard.
      // throttle: ThrottleQueue(25, 1000, true), //all finnhub API requests should be done with finnHub function.
      streamingPriceData: {}, //data shared between some widgets and watchlist menu. Updated by socket data.
      WatchListMenu: 1, //1 = show, 0 = hide
      widgetCopy: { widgetID: null }, //copy of state of widget being dragged.
      widgetLockDown: 0, //1 removes buttons from all widgets.
      widgetList: {}, //lists of all widgets.
      zIndex: [], //list widgets. Index location sets zIndex
    };

    this.baseState = this.state; //used to reset state upon logout.
    //login state logic.
    this.logOut = Logout.bind(this);
    this.processLogin = ProcessLogin.bind(this);

    //app logic for creating/removing, modifying, populating widgets.
    this.newMenuContainer = NewMenuContainer.bind(this);
    this.AddNewWidgetContainer = AddNewWidgetContainer.bind(this);
    this.changeWidgetName = ChangeWidgetName.bind(this);
    this.lockWidgets = LockWidgets.bind(this);
    this.removeWidget = RemoveWidget.bind(this); 
    this.updateWidgetFilters = UpdateWidgetFilters.bind(this); 
    this.updateWidgetStockList = UpdateWidgetStockList.bind(this); 
    this.toggleWidgetVisability = ToggleWidgetVisability.bind(this);
    this.updateWidgetConfig = updateWidgetConfig.bind(this);

    //App logic for setting up dashboards.
    this.loadDashBoard = LoadDashBoard.bind(this);
    this.newDashboard = NewDashboard.bind(this); 
    this.getSavedDashBoards = GetSavedDashBoards.bind(this); 
    this.saveCurrentDashboard = SaveCurrentDashboard.bind(this); 

    //app logic for MOVING widgets and snapping them into location.
    this.setDrag = SetDrag.bind(this);
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
    this.updateDashBoards = this.updateDashBoards.bind(this) //when dashboard menu saves or deletes a dashboard, runs to upddate state.
  }

  componentDidUpdate(prevProps, prevState) {
    const s = this.state;
    const p = this.props;
    
    if (s.login === 1 && prevState.login === 0) {
      console.log("Loggin detected, setting up dashboards.", s.apiKey);
      this.getSavedDashBoards()
      .then(loginDataAndDashboards => {
        // console.log("UPDATE DASH DATA", loginDataAndDashboards)
        this.setState(loginDataAndDashboards)
        // console.log("DATA IS SET!!!!", p)
        p.rBuildDataModel({...loginDataAndDashboards, apiKey: s.apiKey})
      })
      .catch((error) => {
          console.error("Failed to recover dashboards", error);
          // this.setState({dashBoardData: {message: "Problem retrieving dashboards."}})
          });
      ;
    }
    //on load build dataset. //REVISE UPDATE FLAGS
    if ((prevProps.dataModel.created === 'false' && p.dataModel.created === 'true') || (p.dataModel.created === 'updated')) {
      console.log("RUNNING DATA BUILD")
      p.rResetUpdateFlag()
      let setupData = async function(dataset, that){
        await that.props.tGetMongoDB()
        await that.props.tGetFinnhubData(dataset)
      }
      // console.log('p.dataModel.dataSet', p.dataModel.dataSet)
      setupData(Object.keys(p.dataModel.dataSet), this)
    }
    
    if (
        (s.apiKey === '' && s.apiFlag === 0) || 
        (s.apiKey === null && s.apiFlag === 0)
    ) {
        console.log("API key not returned")
        this.setState({
        apiFlag: 1,
        WatchListMenu: 0,
        AboutMenu: 0,
        showStockWidgets: 0,
        }, ()=>{this.toggleBackGroundMenu('about')})
    }

    if (s.globalStockList !== prevState.globalStockList) {
      // console.log('updating Stock Data')
      LoadStockData(this, s, GetStockPrice);
      LoadTickerSocket(this, prevState, s.globalStockList, s.socket, s.apiKey, UpdateTickerSockets);
    }

    if (s.login === 1 && s.loadStartingDashBoard === 0 && s.currentDashBoard !== "") {
      // console.log("loading dashboards", s.dashBoardData)
      this.setState({ loadStartingDashBoard: 1 });
      try {
        if (s.dashBoardData && Object.keys(s.dashBoardData).length > 0) {
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

    if (s.rebuildDataSet === 1) {
      this.setState({rebuildDataSet: 0}, ()=>{
        console.log("REBUILDING")
        // const data = {
        //   apiKey: s.apiKey,
        //   currentDashboard: s.currentDashBoard,
        //   dashBoardData: s.dashBoardData
        // }
        
      console.log("RUNNING DATA BUILD")
      let setupData = async function(dataset, that){
        await that.props.tGetMongoDB()
        await that.props.tGetFinnhubData(dataset)
      }
      setupData(Object.keys(p.dataModel.dataSet), this)
      })
    }
  }

  componentWillUnmount() {
    if (this.state.socket !== "") {
      this.state.socket.close();
    }
  }


  updateGlobalStockList(event, stockRef, stockObj = {}) {
    console.log("updating global stock list")
    console.log()
    //pass stockRef to delete, pass in stockObj to update.
    // console.log("update global: ", stockRef, stockObj)
    const s = this.state;
    const currentStockObj = { ...s.globalStockList };
    if (currentStockObj[stockRef] === undefined) {
      // console.log('updating global list:', stockRef)
      currentStockObj[stockRef] = { ...stockObj };
      currentStockObj[stockRef]["dStock"] = function (ex) {
        //pass in exchange list
        if (ex.length === 1) {
          return this.symbol;
        } else {
          return this.key;
        }
      };
      // GetStockPrice(this, stock, s.apiKey, s.throttle);
    } else {
      delete currentStockObj[stockRef];
    }
    this.setState({ globalStockList: currentStockObj });
    event instanceof Event === true && event.preventDefault();
  }

  syncGlobalStockList() {
    const s = this.state;
    console.log("syncing stocks");
    const updatedWidgetList = produce(s.widgetList, (draftState) => {
      for (const w in draftState) {
        if (draftState[w].widgetConfig === 'stockWidget'){
          draftState[w]["trackedStocks"] = this.state.globalStockList;
        }
      }
    })
    this.setState({ widgetList: updatedWidgetList });
  }

  uploadGlobalStockList(newStockObj) {
    this.setState({ globalStockList: newStockObj });
  }

  updateAPIKey(newKey) {
    this.setState({ apiKey: newKey });
  }

  toggleBackGroundMenu(menu) {
    if (menu === "") {
      this.setState({
        backGroundMenu: menu,
        showStockWidgets: 1,
      });
    } else if (this.state.backGroundMenu !== menu) {
      this.setState({ 
        backGroundMenu: menu,
        showStockWidgets: 0 
        });
    } else {
      this.setState({ 
        backGroundMenu: "",
        showStockWidgets: 1 
      });
    }
  }

  updateAPIFlag(val) {
    if (val > 0) {
      this.setState({
        apiFlag: val,
        showStockWidgets: 0,
        backGroundMenu: "about",
      });
    } else {
      this.setState({ apiFlag: val });
    }
  }

  updateExchangeList(ex) {
    const p = this.props;

    if (typeof ex === "string") {
      const newList = ex.split(",");

      const payload = {
        exchangeList: newList,
        apiKey: this.state.apiKey,
        finnHub: this.state.finnHub,
      };
      p.rUpdateExchangeList(payload);

      this.setState({ exchangeList: newList });
    } else {
      this.setState({ exchangeList: ex });
    }
  }

  updateDefaultExchange(ex) {
    //needs to check local storage and send stock data as part of payload.
    if (ex.target) {
      //runs on dropdown update.
      this.setState({ defaultExchange: ex.target.value });
      this.props.tGetSymbolList(ex.target.value, this.state.apiKey)
    } else {
      //runs on login
      this.setState({ defaultExchange: ex });
    }
  }

  updateDashBoards(data){
    //{dashboardData, currentDashBoard, menuList}
    this.setState(data)
  }

  render() {
    const menuWidgetToggle = MenuWidgetToggle(this);
    const quaryData = queryString.parse(window.location.search);
    const loginScreen =
      this.state.login === 0 && this.state.backGroundMenu === "" ? (
        <Login
          processLogin={this.processLogin}
          queryData={quaryData}
          updateExchangeList={this.updateExchangeList}
          updateDefaultExchange={this.updateDefaultExchange}
        />
      ) : (
        <></>
      );

    const backGroundSelection = {
      endPoint: React.createElement(EndPointMenu, endPointProps(this)),
      manageAccount: React.createElement(AccountMenu, accountMenuProps(this)),
      about: React.createElement(AboutMenu, { apiFlag: this.state.apiFlag }),
      exchangeMenu: React.createElement(ExchangeMenu, exchangeMenuProps(this)),
    };

    const backGroundMenu = () => {
      return <div className="backgroundMenu">{backGroundSelection[this.state.backGroundMenu]}</div>;
    };

    return (
      <>
        <TopNav
          apiFlag={this.state.apiFlag}
          currentDashBoard={this.state.currentDashBoard}
          saveCurrentDashboard={this.saveCurrentDashboard} //saveCurrentDashboard
          login={this.state.login}
          logOut={this.logOut}
          AddNewWidgetContainer={this.AddNewWidgetContainer}
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
          currentDashBoard={this.state.currentDashBoard}
          getSavedDashBoards={this.getSavedDashBoards}
          dashBoardData={this.state.dashBoardData}
          changeWidgetName={this.changeWidgetName}
          updateWidgetFilters={this.updateWidgetFilters}
          // throttle={this.state.throttle}
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
          updateWidgetConfig = {this.updateWidgetConfig}
          widgetCopy={this.state.widgetCopy}
          updateDashBoards={this.updateDashBoards}
          // enableDrag={this.enableDrag}
        />
        {loginScreen}
        {backGroundMenu()}
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  rExchangeList: state.exchangeList.exchangeList,
  dataModel: state.dataModel 
});
export default connect(mapStateToProps, { 
  tGetSymbolList, 
  rUpdateExchangeList, 
  rBuildDataModel,
  tGetFinnhubData,
  tGetMongoDB,
  rResetUpdateFlag,
  // tUpdateExchangeData,

})(App);
