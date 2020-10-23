import React from "react";
import "./App.css";
import TopNav from "./topNav.js";
import Login from "./login.js";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      globalStockList: [], //default stocks for new widgets. Viewable through watchlist. Needs to be depricated and replaced with globalStockObject.
      globalStockObject: {},
      widgetList: {}, //lists of all widgets.
      menuList: {}, //lists of all menu widgets.
      login: 0, //login state. 0 logged out, 1 logged in.
      apiKey: "", //API key retrieved from sqlite3 login database.
      refreshStockData: 0, //if set to 1 stock data should be updated from globalStockList
      dashBoardData: [],
      currentDashBoard: "",
    };
    this.updateGlobalStockList = this.updateGlobalStockList.bind(this);
    this.newWidgetContainer = this.newWidgetContainer.bind(this);
    this.newMenuContainer = this.newMenuContainer.bind(this);
    this.removeWidget = this.removeWidget.bind(this);
    this.processLogin = this.processLogin.bind(this);
    this.moveWidget = this.moveWidget.bind(this);
    this.updateWidgetStockList = this.updateWidgetStockList.bind(this);
    this.loadDashBoard = this.loadDashBoard.bind(this);
    this.toggleRefreshStockData = this.toggleRefreshStockData.bind(this);
    this.saveCurrentDashboard = this.saveCurrentDashboard.bind(this);
    this.getSavedDashBoards = this.getSavedDashBoards.bind(this);
    this.changeWidgetName = this.changeWidgetName.bind(this);
    this.updateWidgetData = this.updateWidgetData.bind(this);
    
  }

  processLogin(setKey, setLogin) {
    this.setState({ login: setLogin });
    this.setState({ apiKey: setKey });
  }

  newWidgetContainer(widgetDescription, widgetHeader, widgetConfig) {
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
  }

  newMenuContainer(widgetDescription, widgetHeader, widgetConfig) {
    const widgetName = widgetDescription;
    var newMenuList = Object.assign({}, this.state.menuList);
    newMenuList[widgetName] = {
      widgetID: widgetName,
      widgetType: widgetDescription,
      widgetHeader: widgetHeader,
      xAxis: "40px",
      yAxis: "40px",
      // trackedStocks: this.state.globalStockList,
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
    // console.log("running");
    fetch("/dashBoard")
      .then((response) => response.json())
      .then((data) => {
        let x = data["savedDashBoards"];
        let newList = {};
        for (const oldKey in x) {
          let newKey = x[oldKey]["dashBoardName"];
          let newData = x[oldKey];
          newList[newKey] = newData;
        }

        this.setState({ dashBoardData: newList });
        this.setState({ menuList: JSON.parse(data["menuSetup"][0]["menuList"]) });
        this.setState({ currentDashBoard: data["menuSetup"][0]["defaultMenu"] });
      })
      .catch((error) => {
        // console.error("Failed to recover dashboards", error);
      });
  }

  loadDashBoard(newGlobalList, newWidgetList) {
    let updateGlobalList = JSON.parse(newGlobalList);
    let updateWidgetList = JSON.parse(newWidgetList);
    this.setState({ globalStockList: updateGlobalList });
    this.setState({ widgetList: updateWidgetList });
    this.setState({ refreshStockData: 1 });
  }

  toggleRefreshStockData() {
    this.setState({ refreshStockData: 0 });
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
      .then((data) => console.log(data))
      .then(() => {
        // console.log("updating dashboard");
        this.getSavedDashBoards();
      });
    // e.preventDefault();
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
          newMenuContainer={this.newMenuContainer}
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
        />
      </>
    ) : (
      <Login updateLogin={this.processLogin} />
    );
  }
}

export default App;
