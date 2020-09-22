import React from "react";
import "./App.css";
import TopNav from "./topNav.js";
import Login from "./login.js";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      globalStockList: [], //default stocks for new widgets. Viewable through watchlist.
      widgetList: {}, //lists of all widgets.
      menuList: {}, //lists of all menu widgets.
      login: 0, //login state. 0 logged out, 1 logged in.
      apiKey: "", //API key retrieved from sqlite3 login database.
      refreshStockData: 0, //if set to 1 stock data should be updated from globalStockList
    };
    this.updateGlobalStockList = this.updateGlobalStockList.bind(this);
    this.newWidgetContainer = this.newWidgetContainer.bind(this);
    this.removeWidget = this.removeWidget.bind(this);
    this.processLogin = this.processLogin.bind(this);
    this.moveWidget = this.moveWidget.bind(this);
    this.updateWidgetStockList = this.updateWidgetStockList.bind(this);
    this.loadDashBoard = this.loadDashBoard.bind(this);
    this.toggleRefreshStockData = this.toggleRefreshStockData.bind(this);
    this.saveCurrentDashboard = this.saveCurrentDashboard.bind(this);
  }

  processLogin(setKey, setLogin) {
    this.setState({ login: setLogin });
    this.setState({ apiKey: setKey });
  }

  newWidgetContainer(widgetDescription, widgetHeader, widgetConfig) {
    //creates a new widget.
    //Multiple instances of each stockWidget allowed. Single instance of each menu widget
    if (widgetConfig === "stockWidget") {
      const widgetName = new Date().getTime();
      var newWidgetList = Object.assign({}, this.state.widgetList);
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
    } else {
      const widgetName = widgetConfig;
      var newMenuList = Object.assign({}, this.state.menuList);
      newMenuList[widgetName] = {
        widgetID: widgetName,
        widgetType: widgetDescription,
        widgetHeader: widgetHeader,
        xAxis: "40px",
        yAxis: "40px",
        trackedStocks: this.state.globalStockList,
        widgetConfig: widgetConfig,
      };
      this.setState({ menuList: newMenuList });
    }
  }

  moveWidget(stateRef, widgetId, xxAxis, yyAxis) {
    //updates x and y pixel location of target widget.
    //stateref should be "widgetList" or "menuList"

    let updatedWidgetLocation = Object.assign(this.state[stateRef]);
    updatedWidgetLocation[widgetId]["xAxis"] = xxAxis;
    updatedWidgetLocation[widgetId]["yAxis"] = yyAxis;
    this.setState({ [stateRef]: updatedWidgetLocation });
  }

  updateWidgetStockList(widgetId, symbol) {
    //adds if not present, else removes stock from widget specific stock list.
    let updateWidgetStockList = Object.assign(this.state.widgetList);
    const trackingSymbolList = updateWidgetStockList[widgetId]["trackedStocks"];

    if (trackingSymbolList.indexOf(symbol) === -1) {
      updateWidgetStockList[widgetId]["widgetList"] = trackingSymbolList.push(symbol);
    } else {
      updateWidgetStockList[widgetId]["widgetList"] = trackingSymbolList.splice(trackingSymbolList.indexOf(symbol), 1);
    }

    this.setState({ widgetList: updateWidgetStockList });
  }

  removeWidget(stateRef, widgetID) {
    //removes widget from stateRef list.
    //stateref should be "widgetList" or "menuList"
    let newWidgetList = Object.assign(this.state[stateRef]);
    delete newWidgetList[widgetID];
    this.setState({ stateRef: newWidgetList });
  }

  updateGlobalStockList(event, stockDescription) {
    //Adds stock to global tracking list.
    let addStockId = stockDescription;
    if (stockDescription.indexOf(":") > 0) {
      addStockId = stockDescription.slice(0, stockDescription.indexOf(":"));
    }
    // const addStockID = stockDescription.slice(0, stockDescription.indexOf(":"));
    var currentStockList = Array.from(this.state.globalStockList);
    if (currentStockList.includes(addStockId) === false) {
      currentStockList.push(addStockId);
    } else {
      currentStockList.splice(currentStockList.indexOf(addStockId), 1);
    }
    this.setState({ globalStockList: currentStockList });
    event.preventDefault();
  }

  loadDashBoard(newGlobalList, newWidgetList) {
    let updateGlobalList = JSON.parse(newGlobalList);
    let updateWidgetList = JSON.parse(newWidgetList);
    console.log(updateGlobalList);
    console.log(this.state.widgetList);
    this.setState({ globalStockList: updateGlobalList });
    this.setState({ widgetList: updateWidgetList });
    this.setState({ refreshStockData: 1 });
  }

  toggleRefreshStockData() {
    this.setState({ refreshStockData: 0 });
  }

  saveCurrentDashboard(e, dashboardName, updateDashBoards) {
    console.log("updating dashboard");
    const data = {
      dashBoardName: dashboardName,
      globalStockList: this.state.globalStockList,
      widgetList: this.state.widgetList,
    };

    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };

    fetch("/dashBoard", options)
      .then((data) => console.log(data))
      .then(() => {
        console.log("updating dashboard");
        updateDashBoards();
      });
    e.preventDefault();
  }

  render() {
    //state.login = 1 means that login succeeded.
    return this.state.login === 1 ? (
      <>
        <TopNav
          availableStocks={this.state.availableStocks}
          globalStockList={this.state.globalStockList}
          widgetList={this.state.widgetList}
          menuList={this.state.menuList}
          updateGlobalStockList={this.updateGlobalStockList}
          newWidgetContainer={this.newWidgetContainer}
          moveWidget={this.moveWidget}
          removeWidget={this.removeWidget}
          apiKey={this.state.apiKey}
          updateWidgetStockList={this.updateWidgetStockList}
          loadDashBoard={this.loadDashBoard}
          refreshStockData={this.state.refreshStockData}
          toggleRefreshStockData={this.toggleRefreshStockData}
          saveCurrentDashboard={this.saveCurrentDashboard}
        />
      </>
    ) : (
      <Login updateLogin={this.processLogin} />
    );
  }
}

export default App;
