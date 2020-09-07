import React from "react";
import StockSearchPane from "./stockSearchPane.js";

//Widget body component. Shows stock detail info and recent news. Maybe a graph?
class StockDetailWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // widgetList: "",
      widgetList: [],
    };

    this.updateWidgetList = this.updateWidgetList.bind(this);
    this.renderStockData = this.renderStockData.bind(this);
    this.buildForm = this.buildForm.bind(this);
  }

  // componentDidUpdate(prevProps, prevState) {
  //   if (this.state.widgetList !== prevState.widgetList) {
  //     this.state.widgetList.length === 1 ? this.props.updateHeader(this.state.widgetList[0]) : this.props.updateHeader("Multiple Stocks");
  //   }
  // }

  updateWidgetList(stock) {
    var stockSymbole = stock.slice(0, stock.indexOf(":"));
    var newWidgetList = this.state.widgetList.slice();
    newWidgetList.push(stockSymbole);
    this.setState({ widgetList: newWidgetList });
  }

  renderStockData() {
    let trackedStockData = this.props.trackedStockData;
    let thisStock = this.state.widgetList;
    // let thisStockSymbol = thisStock.slice(0, thisStock.indexOf(":"));
    // let thisStockData = trackedStockData[thisStockSymbol];
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
                  let oldList = Array.from(this.state.widgetList);
                  oldList.splice(oldList.indexOf({ el }), 1);
                  this.setState({ widgetList: oldList });
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
        // {this.props.showEditPane === 1 ? </form> : <></> }
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
    //console.log(stockDetailRow);
    return buildTable;
  }

  buildForm() {
    let editForm = <>{this.props.showEditPane === 1 ? <form>{this.renderStockData()}</form> : <>{this.renderStockData()}</>}</>;
    return editForm;
  }

  render() {
    return (
      <>
        {this.props.showEditPane === 1 && (
          <StockSearchPane
            availableStocks={this.props.availableStocks}
            UpdateStockTrackingList={this.props.UpdateStockTrackingList}
            showSearchPane={() => this.props.showPane("showEditPane")}
            getStockPrice={this.props.getStockPrice}
            updateWidgetList={this.updateWidgetList}
          />
        )}
        {Object.keys(this.props.trackedStockData).length > 0 ? this.renderStockData() : <></>}
      </>
    );
  }
}

export default StockDetailWidget;
