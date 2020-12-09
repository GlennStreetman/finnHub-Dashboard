import React from "react";
import StockSearchPane from "../../../components/stockSearchPane.js";

export default class Quote extends React.Component {
  //widget data provided by appFunctions/getSTockPrices
  //Data is shared with widgets/Menu/watchListMenu
  constructor(props) {
    super(props);
    this.state = {
      flashUpdate: {},
    };

    this.updateWidgetList = this.updateWidgetList.bind(this);
    this.renderStockData = this.renderStockData.bind(this);
  }

  updateWidgetList(stock) {
    // console.log("updating");
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

    for (const x in thisStock) {
      if (trackedStockData[thisStock[x]] === undefined ) {
        trackedStockData[thisStock[x]] = {prevClosePrice: 0, dayOpenPrice:0, dayLowPrice:0, dayHighPrice:0, currentPrice:0,}
      }
    }
    let stockDetailRow = thisStock.map((el) =>
        trackedStockData[el] ? (
        <tr key={el + "st" + + trackedStockData[el]["currentPrice"]}>
          <td key={el + "id"}>{el}</td>
          <td className="rightTE" key={el + "prevClosePrice"}>
            {trackedStockData[el]["prevClosePrice"].toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </td>
          <td className="rightTE" key={el + "dayOpenPrice"}>
            {trackedStockData[el]["dayOpenPrice"].toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </td>
          <td className="rightTE" key={el + "dayLowPrice"}>
            {trackedStockData[el]["dayLowPrice"].toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </td>
          <td className="rightTE" key={el + "dayHighPrice"}>
            {trackedStockData[el]["dayHighPrice"].toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </td>
          {/* <td className={this.state.flashUpdate[el]} key={el + "currentPrice" + trackedStockData[el]["currentPrice"]}> */}
          <td className='rightTEFade' key={el + "currentPrice" + trackedStockData[el]["currentPrice"]}>
            
            {trackedStockData[el]["currentPrice"].toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </td>

          {this.props.showEditPane === 1 ? (
            <td className="rightTE" key={el + "buttonBox"}>
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
            <td className="centerTE" key={this.props.widgetKey + "close"}>
              Prev Close
            </td>
            <td className="centerTE" key={this.props.widgetKey + "open"}>
              Day Open
            </td>
            <td className="centerTE" key={this.props.widgetKey + "low"}>
              Day Low
            </td>
            <td className="centerTE" key={this.props.widgetKey + "high"}>
              Day High
            </td>
            <td className="centerTE" key={this.props.widgetKey + "price"}>
              Price
            </td>

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
            // getStockPrice={this.props.getStockPrice}
            apiKey={this.props.apiKey}
            updateWidgetStockList={this.props.updateWidgetStockList}
            widgetKey={this.props.widgetKey}
            throttle={this.props.throttle}
          />
        )}
        {Object.keys(this.props.trackedStockData).length > 0 ? this.renderStockData() : <></>}
      </>
    );
  }
}

export function stockDetailWidgetProps(that, key = "Quote") {
  let propList = {
    apiKey: that.props.apiKey,
    // getStockPrice: that.props.getStockPrice,
    showPane: that.showPane,
    trackedStocks: that.props.widgetList[key]["trackedStocks"],
    trackedStockData: that.props.trackedStockData,
    updateGlobalStockList: that.props.updateGlobalStockList,
    updateWidgetStockList: that.props.updateWidgetStockList,
    widgetKey: key,
    throttle: that.props.throttle,
  };
  return propList;
}

