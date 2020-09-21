import React from "react";
import StockSearchPane from "../../stockSearchPane.js";

//Widget body component. Shows stock detail info and recent news. Maybe a graph?
class StockDetailWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.updateWidgetList = this.updateWidgetList.bind(this);
    this.renderStockData = this.renderStockData.bind(this);
  }

  // componentDidMount() {
  //   console.log(this.props.trackedStocks);
  //   for (const stock in this.props.trackedStocks) {
  //     this.updateWidgetList(stock);
  //   }
  // }

  updateWidgetList(stock) {
    if (stock.indexOf(":") > 0) {
      const stockSymbole = stock.slice(0, stock.indexOf(":"));
      this.props.updateWidgetStockList(this.props.widgetKey, stockSymbole);
    } else {
      this.props.updateWidgetStockList(this.props.widgetKey, stock);
    }
  }

  renderStockData() {
    let trackedStockData = this.props.trackedStockData;
    let thisStock = this.props.trackedStocks;
    let stockDetailRow = thisStock.map((el) =>
      trackedStockData[el] ? (
        <tr key={el + "st"}>
          <td key={el + "id"}>{el}</td>
          <td key={el + "currentPrice"}>
            {trackedStockData[el]["currentPrice"].toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </td>
          <td key={el + "dayHighPrice"}>
            {trackedStockData[el]["dayHighPrice"].toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </td>
          <td key={el + "dayLowPrice"}>
            {trackedStockData[el]["dayLowPrice"].toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </td>
          <td key={el + "dayOpenPrice"}>
            {trackedStockData[el]["dayOpenPrice"].toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </td>
          <td key={el + "prevClosePrice"}>
            {trackedStockData[el]["prevClosePrice"].toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </td>

          {this.props.showEditPane === 1 ? (
            <td key={el + "buttonBox"}>
              <button
                key={el + "button"}
                onClick={() => {
                  this.updateWidgetList(el);
                }}
              >
                <i className="fa fa-times" aria-hidden="true"></i>
              </button>
            </td>
          ) : (
            <></>
          )}
        </tr>
      ) : (
        <tr key={el + "cat"}></tr>
      )
    );
    let buildTable = (
      <table className="widgetBodyTable" key={this.props.widgetKey + "id"}>
        <thead key={this.props.widgetKey + "head"}>
          <tr key={this.props.widgetKey + "tr"}>
            <td key={this.props.widgetKey + "stock"}>Stock</td>
            <td key={this.props.widgetKey + "price"}>Price</td>
            <td key={this.props.widgetKey + "high"}>Day High</td>
            <td key={this.props.widgetKey + "low"}>Day Low</td>
            <td key={this.props.widgetKey + "open"}>Day Open</td>
            <td key={this.props.widgetKey + "close"}>Prev Close</td>
            {this.props.showEditPane === 1 ? <td key={this.props.widgetKey + "remove"}>Remove</td> : <></>}
          </tr>
        </thead>
        <tbody key={this.props.widgetKey + "body"}>{stockDetailRow}</tbody>
      </table>
    );

    return buildTable;
  }

  render() {
    return (
      <>
        {this.props.showEditPane === 1 && (
          <StockSearchPane
            updateGlobalStockList={this.props.updateGlobalStockList}
            showSearchPane={() => this.props.showPane("showEditPane", 1)}
            getStockPrice={this.props.getStockPrice}
            apiKey={this.props.apiKey}
            updateWidgetStockList={this.props.updateWidgetStockList}
            widgetKey={this.props.widgetKey}
          />
        )}
        {Object.keys(this.props.trackedStockData).length > 0 ? this.renderStockData() : <></>}
      </>
    );
  }
}

export default StockDetailWidget;
