import React from "react";
import "./App.css";
import StockWatchList from "./stockWatchList.js";
import StockSearchPane from "./stockSearchPane.js";
import StockDetailWidget from "./stockDetailWidget.js";
import WidgetControl from "./widgetControl.js";
// import { render } from "@testing-library/react";

class TopNav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showAddWatchlistMenu: 0,
      showWatchlistMenu: 0,
      showAddWidgetDropdown: 0,
      trackedStockData: {},
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
    console.log(stockTrackingList);

    socket.addEventListener("open", function (event) {
      stockTrackingList.map((el) => socket.send(JSON.stringify({ type: "subscribe", symbol: el })));
    });

    // Listen for messages
    socket.addEventListener("message", function (event) {
      var tickerReponse = JSON.parse(event.data);
      console.log("Message from server ", event.data);
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
        console.log("done");
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
                      this.props.newStockWidget(StockDetailWidget, "Stock Tracker: ");
                    }}
                  >
                    Stock Detail Widget
                  </a>
                  <a href="#2">Link 2</a>
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

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      availableStocks: [],
      stockTrackingList: [],
      widgetList: {},
    };
    this.UpdateStockTrackingList = this.UpdateStockTrackingList.bind(this);
    this.newStockWidget = this.newStockWidget.bind(this);
  }

  newStockWidget(widgetDescription, widgetHeader) {
    const widgetName = new Date().getTime();
    var newWidgetList = Object.assign({}, this.state.widgetList);
    newWidgetList[widgetName] = {
      widgetID: widgetName,
      widgetType: widgetDescription,
      widgetHeader: widgetHeader,
      trackedStocks: "blank",
    };
    this.setState({ widgetList: newWidgetList });
  }

  getSymbolList() {
    fetch("https://finnhub.io/api/v1/stock/symbol?exchange=US&token=bsuu7qv48v6qu589jlj0")
      .then((response) => response.json())
      .then((data) => {
        let transformData = {};
        for (const [, stockValues] of Object.entries(data)) {
          //deconstruct API object
          const { currency: a, description: b, displaySymbol: c, symbol: d, type: e } = stockValues;
          //set API object keys equal to stock symbol value instad of numeric value
          transformData[d] = {
            currency: a,
            description: b,
            displaySymbol: c,
            symbol: d,
            type: e,
          };
        }
        this.setState({ availableStocks: transformData });
        console.log("Success retrieving stock symbols");
      })
      .catch((error) => {
        console.error("Error retrieving stock symbols", error);
      });
  }

  componentDidMount() {
    this.getSymbolList();
  }

  UpdateStockTrackingList(event, stockDescription) {
    const addStockID = stockDescription.slice(0, stockDescription.indexOf(":"));
    console.log(addStockID);
    var currentStockList = Array.from(this.state.stockTrackingList);

    if (currentStockList.includes(addStockID) === false) {
      currentStockList.push(addStockID);
      this.setState({ stockTrackingList: currentStockList });
    }

    event.preventDefault();
  }

  render() {
    // let widgetState = this.state.widgetList;
    // let widgetRender = Object.keys(widgetState).map((el) => <WidgetControl key={el} widgetKey={el} widgetList={widgetState[el]} />);
    return (
      <>
        <TopNav
          availableStocks={this.state.availableStocks}
          stockTrackingList={this.state.stockTrackingList}
          widgetList={this.state.widgetList}
          UpdateStockTrackingList={this.UpdateStockTrackingList}
          newStockWidget={this.newStockWidget}
        />
      </>
    );
  }
}

export default App;
