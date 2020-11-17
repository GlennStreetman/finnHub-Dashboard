import React from "react";
import StockSearchPane from "../../stockSearchPane.js";

class WatchListMenu extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      availableStocks: {},
    };
  }

  componentDidMount() {
    this.getSymbolList();
  }

  getSymbolList() {
    if (this.props.apiKey !== '') {  
      let that = this
      this.props.throttle.enqueue(function() {  
      fetch("https://finnhub.io/api/v1/stock/symbol?exchange=US&token=bsuu7qv48v6qu589jlj0")
        .then((response) => {
          if (response.status === 429) {
            this.props.throttle.setSuspend(3000)
            this.getSymbolList()
          }
          console.log(Date().slice(20,25) + ":symbol list")
          return response.json()})
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
          that.setState({ availableStocks: transformData });
          // console.log("Success retrieving stock symbols");
        })
        .catch((error) => {
          console.error("Error retrieving stock symbols", error);
        });
      })
    }
  }

  renderWatchedStocks() {
    //console.log("rendering watched stocks");
    const watchListStocks = this.props.globalStockList;
    const stockListKey = watchListStocks.map((el) => (
      <tr key={el + "row"}>
        <td key={el + "desc"}>
          {el + ": "}
          {this.state.availableStocks[el] ? this.state.availableStocks[el]["description"] : <></>}
        </td>
        <td className="rightTE" key={el + "prc"}>
          {this.props.trackedStockData[el] ? (
            this.props.trackedStockData[el]["currentPrice"].toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          ) : (
            <></>
          )}
        </td>
        <td className="centerTE" key={el + "rmv"}>
          <button
            key={el + "clck"}
            onClick={(e) => {
              this.props.updateGlobalStockList(e, el);
            }}
          >
            <i className="fa fa-times" aria-hidden="true"></i>
          </button>
        </td>
      </tr>
    ));

    return <>{stockListKey}</>;
  }

  render() {
    return (
      <>
        {this.props.showEditPane === 1 && (
          <StockSearchPane
            updateWidgetStockList={this.props.updateWidgetStockList}
            widgetKey={this.props.widgetKey}
            updateGlobalStockList={this.props.updateGlobalStockList}
            showSearchPane={() => this.props.showPane("showEditPane", 1)}
            getStockPrice={this.props.getStockPrice}
            apiKey={this.props.apiKey}
            throttle={this.props.throttle}
          />
        )}

        <table>
          <thead>
            <tr>
              <td className="centerTE">Description</td>
              <td className="centerTE">Price</td>
              <td className="centerTE">Remove</td>
            </tr>
          </thead>
          <tbody>{this.renderWatchedStocks()}</tbody>
        </table>
      </>
    );
  }
}

export function watchListMenuProps(that, key = "WatchListMenu") {
  let propList = {
    apiKey: that.props.apiKey,
    globalStockList: that.props.globalStockList,
    getStockPrice: that.getStockPrice,
    showPane: that.props.showPane,
    trackedStockData: that.state.trackedStockData,
    updateGlobalStockList: that.props.updateGlobalStockList,
    updateWidgetStockList: that.props.updateWidgetStockList,
    widgetKey: key,
    throttle: that.props.throttle,
  };
  return propList;
}

export default WatchListMenu;
