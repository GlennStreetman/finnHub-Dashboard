import React from "react";

//used by "view watchlist" from top bar. Displays list of all tracked stocks. Updating by any ticker sockets.
class StockWatchList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      availableStocks: {},
    };
    this.renderWatchedStocks = this.renderWatchedStocks.bind(this);
    this.getSymbolList = this.getSymbolList.bind(this);
  }

  componentDidMount() {
    this.getSymbolList();
  }

  getSymbolList() {
    fetch("https://finnhub.io/api/v1/stock/symbol?exchange=US&token=bsuu7qv48v6qu589jlj0")
      .then((response) => response.json())
      .then((data) => {
        let transformData = {};
        for (const [, stockValues] of Object.entries(data)) {
          //deconstruct API object
          const {
            // currency: a,
            description: b,
            displaySymbol: c,
            // symbol: d,
            // type: e
          } = stockValues;
          //set API object keys equal to stock symbol value instad of numeric value
          transformData[c] = {
            // currency: a,
            description: b,
            displaySymbol: c,
            // symbol: d,
            // type: e,
          };
        }
        this.setState({ availableStocks: transformData });
        // console.log("Success retrieving stock symbols");
      })
      .catch((error) => {
        console.error("Error retrieving stock symbols", error);
      });
  }

  renderWatchedStocks() {
    //console.log("rendering watched stocks");
    const watchListStocks = this.props.stockTrackingList;
    const stockListKey = watchListStocks.map((el) => (
      <a key={el + "WL"} href="#watchList">
        {el + ": "}
        {this.state.availableStocks[el] ? this.state.availableStocks[el]["description"] : <></>}
        {": "}
        {this.props.trackedStockData[el] ? this.props.trackedStockData[el]["currentPrice"].toFixed(2) : <></>}
        {/* {<OpenTicketConnect stockSymbol={el} />} */}
      </a>
    ));

    return <div className="sidenav">{stockListKey}</div>;
  }

  render() {
    return <>{this.renderWatchedStocks()}</>;
  }
}

export default StockWatchList;
