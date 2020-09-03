import React from "react";

//used by "view watchlist" from top bar. Displays list of all tracked stocks. Updating by any ticker sockets.
class StockWatchList extends React.Component {
  constructor(props) {
    super(props);
    this.renderWatchedStocks = this.renderWatchedStocks.bind(this);
  }

  renderWatchedStocks() {
    //console.log("rendering watched stocks");
    const watchListStocks = this.props.stockTrackingList;
    const stockListKey = watchListStocks.map((el) => (
      <a key={el + "WL"} href="#watchList">
        {el + ": "}
        {this.props.availableStocks[el] ? this.props.availableStocks[el]["description"] : <></>}
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
