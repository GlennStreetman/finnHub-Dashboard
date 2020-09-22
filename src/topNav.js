import React from "react";
import StockWatchList from "./stockWatchList.js";
import StockSearchPane from "./stockSearchPane.js";
import WidgetControl from "./widgets/widgetControl.js";
// import DashBoardMenu from "./dashBoardMenu.js";
// import { render } from "@testing-library/react";

class TopNav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showAddWatchlistMenu: 0,
      showWatchlistMenu: 0,
      showAddWidgetDropdown: 0,
      trackedStockData: {},
      widgetLockDown: 0, //1: Hide buttons, 0: Show buttons
      showDashBoardMenu: 0,
    };

    this.showPane = this.showPane.bind(this);
    this.getStockPrice = this.getStockPrice.bind(this);
    this.updateTickerSockets = this.updateTickerSockets.bind(this);
    this.dashBoardToggle = this.dashBoardToggle.bind(this);
  }

  componentDidUpdate() {
    if (this.props.refreshStockData === 1) {
      console.log("updating stock connections");
      // this.setState({ widgetLockDown: 1 });
      this.props.toggleRefreshStockData();
      // console.log("updating");
      // console.log(this.props.globalStockList);

      for (const stock in this.props.globalStockList) {
        // console.log(this.props.globalStockList[stock]);
        this.getStockPrice(this.props.globalStockList[stock]);
      }
    }
  }

  updateTickerSockets() {
    //opens a series of socket connections to live stream stock prices
    const self = this;
    const globalStockList = this.props.globalStockList;
    const socket = new WebSocket("wss://ws.finnhub.io?token=" + this.props.apiKey);

    socket.addEventListener("open", function (event) {
      globalStockList.map((el) => socket.send(JSON.stringify({ type: "subscribe", symbol: el })));
    });

    // Listen for messages
    socket.addEventListener("message", function (event) {
      var tickerReponse = JSON.parse(event.data);
      // console.log("Message from server ", event.data);
      if (tickerReponse.data) {
        self.setState((prevState) => {
          let stockTickData = Object.assign({}, prevState.trackedStockData);
          let stockSymbol = tickerReponse.data[0]["s"];
          stockTickData[stockSymbol]["currentPrice"] = tickerReponse.data[0]["p"];
          return { trackedStockData: stockTickData };
        });
      }
    });
  }

  showPane(stateRef, fixState = 0) {
    //toggles view of specified menu. 1 = open 0 = closed
    let showMenu = this.state[stateRef] === 0 ? 1 : 0;
    fixState === 1 && (showMenu = 1);
    this.setState({ [stateRef]: showMenu });
  }

  getStockPrice(stockDescription) {
    //takes stock symbol, returns object containing days basic stock price info.
    // console.log(stockDescription);
    // console.log(stockDescription.indexOf(":"));
    const stockSymbol = stockDescription.indexOf(":") > 0 ? stockDescription.slice(0, stockDescription.indexOf(":")) : stockDescription;
    // console.log(stockSymbol);
    let stockPriceData = {};
    fetch("https://finnhub.io/api/v1/quote?symbol=" + stockSymbol + "&token=" + this.props.apiKey)
      .then((response) => response.json())
      .then((data) => {
        //destructure data returned from fetch.
        const {
          c: a, //current price
          h: b, //current days high price
          l: c, //current days low price
          o: d, //current days open price
          pc: e, //previous days close price
        } = data;
        //create object from destructured data above.
        stockPriceData = {
          currentPrice: a,
          dayHighPrice: b,
          dayLowPrice: c,
          dayOpenPrice: d,
          prevClosePrice: e,
        };

        this.setState((prevState) => {
          let newTrackedStockData = Object.assign({}, prevState.trackedStockData);
          newTrackedStockData[stockSymbol] = stockPriceData;
          return { trackedStockData: newTrackedStockData };
        });
      })
      .then(() => {
        // console.log("done");
        this.updateTickerSockets();
      });
    // return stockPriceData
  }

  dashBoardToggle() {
    if (this.state.showDashBoardMenu === 0 && this.props.menuList["menuWidget"] === undefined) {
      console.log("new container");
      this.props.newWidgetContainer("DashBoardMenu", "Saved Dashboards: ", "menuWidget");
      this.setState({ showDashBoardMenu: 1 });
    } else if (this.state.showDashBoardMenu === 0 && this.props.menuList["menuWidget"] !== undefined) {
      this.setState({ showDashBoardMenu: 1 });
    } else {
      this.setState({ showDashBoardMenu: 0 });
    }
  }

  render() {
    let widgetState = this.props.widgetList;
    let widgetRender = Object.keys(widgetState).map((el) => (
      <WidgetControl
        key={el}
        widgetKey={el}
        widgetList={widgetState[el]}
        globalStockList={this.props.globalStockList}
        updateGlobalStockList={this.props.updateGlobalStockList}
        getStockPrice={this.getStockPrice}
        trackedStockData={this.state.trackedStockData}
        moveWidget={this.props.moveWidget}
        removeWidget={this.props.removeWidget}
        widgetLockDown={this.state.widgetLockDown}
        apiKey={this.props.apiKey}
        updateWidgetStockList={this.props.updateWidgetStockList}
        loadDashBoard={this.props.loadDashBoard}
        stateRef="widgetList"
        saveCurrentDashboard={this.props.saveCurrentDashboard}
      />
    ));
    let menuState = this.props.menuList;
    let menuRender = Object.keys(menuState).map((el) => (
      <WidgetControl
        key={el}
        widgetKey={el}
        widgetList={menuState[el]}
        globalStockList={this.props.globalStockList}
        updateGlobalStockList={this.props.updateGlobalStockList}
        getStockPrice={this.getStockPrice}
        trackedStockData={this.state.trackedStockData}
        moveWidget={this.props.moveWidget}
        removeWidget={this.props.removeWidget}
        widgetLockDown={this.state.widgetLockDown}
        apiKey={this.props.apiKey}
        updateWidgetStockList={this.props.updateWidgetStockList}
        loadDashBoard={this.props.loadDashBoard}
        stateRef="menuList"
        saveCurrentDashboard={this.props.saveCurrentDashboard}
        showDashBoardMenu={this.state.showDashBoardMenu}
        dashBoardToggle={this.dashBoardToggle}
      />
    ));

    return (
      <>
        <div className="topnav">
          <a href="#home">About</a>
          <div>
            <a href="#contact" onClick={() => this.showPane("showWatchlistMenu")}>
              {this.state.showWatchlistMenu === 0 ? "View Watchlist Hide" : "Hide Watchlist Menu"}
            </a>
          </div>
          <div>
            <a href="#cat" onClick={() => this.showPane("showAddWatchlistMenu")}>
              {this.state.showAddWatchlistMenu === 0 ? "Add Stock to Watchlist" : "Hide Search"}
            </a>
          </div>

          <div>
            <a href="#contact" onClick={() => (this.state.widgetLockDown === 0 ? this.setState({ widgetLockDown: 1 }) : this.setState({ widgetLockDown: 0 }))}>
              {this.state.widgetLockDown === 0 ? "Lock Widgets" : "Unlock Widgets"}
            </a>
          </div>
          <div>
            {/* add onclick */}

            <a href="#contact" onClick={() => this.dashBoardToggle()}>
              {/* <a href="#contact" onClick={() => this.showPane("showDashBoardMenu")}> */}
              {this.state.showDashBoardMenu === 0 ? "Show Dashboard Menu" : "Hide Dashboard Menu"}
            </a>
          </div>
          <div className="dropDiv" onMouseLeave={() => this.showPane("showAddWidgetDropdown")}>
            <a href="#test" className="dropbtn" onMouseOver={() => this.showPane("showAddWidgetDropdown")}>
              Add Widget
            </a>
            {this.state.showAddWidgetDropdown === 1 && (
              <div className="dropdown">
                <div className="dropdown-content">
                  <a
                    href="#1"
                    onClick={() => {
                      this.props.newWidgetContainer("StockDetailWidget", "Stock Values: ", "stockWidget");
                    }}
                  >
                    Day Stock Price
                  </a>
                  <a
                    href="#2"
                    onClick={() => {
                      this.props.newWidgetContainer("NewsWidget", "Recent News: ", "stockWidget");
                    }}
                  >
                    News Widget
                  </a>
                  <a
                    href="#3"
                    onClick={() => {
                      this.props.newWidgetContainer("CandleWidget", "Candle Data: ", "stockWidget");
                    }}
                  >
                    Stock Candles
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          {this.state.showAddWatchlistMenu === 1 && (
            <StockSearchPane
              globalStockList={this.props.globalStockList}
              updateGlobalStockList={this.props.updateGlobalStockList}
              showSearchPane={() => this.showPane("showWatchlistMenu", 1)}
              getStockPrice={this.getStockPrice}
              apiKey={this.props.apiKey}
            />
          )}
        </div>

        <div>
          {this.state.showWatchlistMenu === 1 && (
            <StockWatchList
              globalStockList={this.props.globalStockList}
              showWatchListPane={() => this.showPane("showWatchlistMenu")}
              trackedStockData={this.state.trackedStockData}
              updateGlobalStockList={this.props.updateGlobalStockList}
            />
          )}
        </div>
        {widgetRender}
        {menuRender}
      </>
    );
  }
}

export default TopNav;
