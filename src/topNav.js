import React from "react";
import StockWatchList from "./stockWatchList.js";
import StockSearchPane from "./stockSearchPane.js";
import StockDetailWidget from "./stockDetailWidget.js";
import WidgetControl from "./widgetControl.js";
import NewsWidget from "./newsWidget.js";
// import { render } from "@testing-library/react";

class TopNav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showAddWatchlistMenu: 0,
      showWatchlistMenu: 0,
      showAddWidgetDropdown: 0,
      trackedStockData: {},
      widgetLockDown: 0,
    };

    this.showPane = this.showPane.bind(this);
    this.getStockPrice = this.getStockPrice.bind(this);
    this.updateTickerSockets = this.updateTickerSockets.bind(this);
  }

  updateTickerSockets() {
    const self = this;
    // Connection opened -> Subscribe
    const stockTrackingList = this.props.stockTrackingList;
    const socket = new WebSocket("wss://ws.finnhub.io?token=bsuu7qv48v6qu589jlj0");
    //console.log(stockTrackingList);

    socket.addEventListener("open", function (event) {
      stockTrackingList.map((el) => socket.send(JSON.stringify({ type: "subscribe", symbol: el })));
    });

    // Listen for messages
    socket.addEventListener("message", function (event) {
      var tickerReponse = JSON.parse(event.data);
      //   console.log("Message from server ", event.data);
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

  showPane(stateRef) {
    let showMenu = this.state[stateRef] === 0 ? 1 : 0;
    this.setState({ [stateRef]: showMenu });
  }

  getStockPrice(stockDescription) {
    //takes stock symbol, returns object containing days basic stock price info.
    const stockSymbol = stockDescription.slice(0, stockDescription.indexOf(":"));
    let stockPriceData = {};
    fetch("https://finnhub.io/api/v1/quote?symbol=" + stockSymbol + "&token=bsuu7qv48v6qu589jlj0")
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

  render() {
    let widgetState = this.props.widgetList;
    let widgetRender = Object.keys(widgetState).map((el) => (
      <WidgetControl
        key={el}
        widgetKey={el}
        widgetList={widgetState[el]}
        availableStocks={this.props.availableStocks}
        UpdateStockTrackingList={this.props.UpdateStockTrackingList}
        getStockPrice={this.getStockPrice}
        trackedStockData={this.state.trackedStockData}
        removeWidget={this.props.removeWidget}
        widgetLockDown={this.state.widgetLockDown}
      />
    ));
    return (
      <>
        <div className="topnav">
          <a href="#home">About</a>
          <div>
            <a href="#contact" onClick={() => this.showPane("showWatchlistMenu")}>
              View Watchlist
            </a>
          </div>
          <div>
            <a href="#cat" onClick={() => this.showPane("showAddWatchlistMenu")}>
              Add Stock to Watchlist
            </a>
          </div>

          <div>
            <a href="#contact" onClick={() => (this.state.widgetLockDown === 0 ? this.setState({ widgetLockDown: 1 }) : this.setState({ widgetLockDown: 0 }))}>
              {this.state.widgetLockDown === 0 ? "Lock Widgets" : "Unlock Widgets"}
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
                      this.props.newStockWidget(StockDetailWidget, "Stock Values: ");
                    }}
                  >
                    Stock Detail Widget
                  </a>
                  <a
                    href="#1"
                    onClick={() => {
                      this.props.newStockWidget(NewsWidget, "Recent News: ");
                    }}
                  >
                    News Widget
                  </a>
                  <a href="#3">Link 3</a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          {this.state.showAddWatchlistMenu === 1 && (
            <StockSearchPane
              availableStocks={this.props.availableStocks}
              // stockTrackingList={this.props.stockTrackingList}
              UpdateStockTrackingList={this.props.UpdateStockTrackingList}
              showSearchPane={() => this.showPane("showAddWatchlistMenu")}
              getStockPrice={this.getStockPrice}
            />
          )}
        </div>

        <div>
          {this.state.showWatchlistMenu === 1 && (
            <StockWatchList
              stockTrackingList={this.props.stockTrackingList}
              availableStocks={this.props.availableStocks}
              showWatchListPane={() => this.showPane("showWatchlistMenu")}
              trackedStockData={this.state.trackedStockData}
            />
          )}
        </div>

        {widgetRender}
      </>
    );
  }
}

export default TopNav;
