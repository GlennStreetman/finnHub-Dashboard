import React from "react";
import "./App.css";
import TopNav from "./topNav.js";
import Login from "./login.js";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      globalStockList: [], //default stocks for new widgets. Viewable through watchlist.
      widgetList: {}, //lists of all widgets
      login: 0, //login state. 0 logged out, 1 logged in.
      apiKey: "", //API key retrieved from sqlite3 login database.
    };
    this.updateGlobalStockList = this.updateGlobalStockList.bind(this);
    this.newStockWidget = this.newStockWidget.bind(this);
    this.removeWidget = this.removeWidget.bind(this);
    this.processLogin = this.processLogin.bind(this);
    this.moveWidget = this.moveWidget.bind(this);
    this.updateWidgetStockList = this.updateWidgetStockList.bind(this);
  }

  processLogin(setKey, setLogin) {
    this.setState({ login: setLogin });
    this.setState({ apiKey: setKey });
  }

  newStockWidget(widgetDescription, widgetHeader) {
    //creates a new widget
    const widgetName = new Date().getTime();
    var newWidgetList = Object.assign({}, this.state.widgetList);
    newWidgetList[widgetName] = {
      widgetID: widgetName,
      widgetType: widgetDescription,
      widgetHeader: widgetHeader,
      xAxis: "40px",
      yAxis: "40px",
      trackedStocks: this.state.globalStockList,
    };
    this.setState({ widgetList: newWidgetList });
  }

  moveWidget(widgetId, xxAxis, yyAxis) {
    //updates x and y pixel location of target widget.
    let updatedWidgetLocation = Object.assign(this.state.widgetList);
    updatedWidgetLocation[widgetId]["xAxis"] = xxAxis;
    updatedWidgetLocation[widgetId]["yAxis"] = yyAxis;
    this.setState({ widgetList: updatedWidgetLocation });
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

  removeWidget(widgetID) {
    let newWidgetList = Object.assign(this.state.widgetList);
    delete newWidgetList[widgetID];
    this.setState({ widgetList: newWidgetList });
  }

  updateGlobalStockList(event, stockDescription) {
    //Adds stock to global tracking list.
    const addStockID = stockDescription.slice(0, stockDescription.indexOf(":"));
    var currentStockList = Array.from(this.state.globalStockList);
    if (currentStockList.includes(addStockID) === false) {
      currentStockList.push(addStockID);
      this.setState({ globalStockList: currentStockList });
    }
    event.preventDefault();
  }

  render() {
    //state.login = 1 means that login succeeded.
    return this.state.login === 1 ? (
      <>
        <TopNav
          availableStocks={this.state.availableStocks}
          globalStockList={this.state.globalStockList}
          widgetList={this.state.widgetList}
          updateGlobalStockList={this.updateGlobalStockList}
          newStockWidget={this.newStockWidget}
          moveWidget={this.moveWidget}
          removeWidget={this.removeWidget}
          apiKey={this.state.apiKey}
          updateWidgetStockList={this.updateWidgetStockList}
        />
      </>
    ) : (
      <Login updateLogin={this.processLogin} />
    );
  }
}

export default App;
