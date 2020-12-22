import Papa from 'papaparse'
import React from "react";
import StockSearchPane, {searchPaneProps} from "../../../components/stockSearchPane.js";
import {dStock} from "../../../appFunctions/formatStockSymbols.js";

class WatchListMenu extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      availableStocks: {},
    };

    this.inputReference = React.createRef();
    this.baseState = {mounted: true}
    // this.getSymbolList = this.getSymbolList.bind(this);
    this.renderWatchedStocks = this.renderWatchedStocks.bind(this);
    this.fileUploadAction = this.fileUploadAction.bind(this);
    this.fileUploadInputChange = this.fileUploadInputChange.bind(this);
  }

  componentWillUnmount(){
    this.baseState.mounted = false
  }

  renderWatchedStocks() {
    //console.log("rendering watched stocks");
    const p = this.props
    const watchListStocks = p.globalStockList;
    const stockListKey = watchListStocks.map((el) => (
      <tr key={el + "row"}>
        <td key={el + "desc"}>
          {dStock(el, p.exchangeList) + ": "}
          {this.state.availableStocks[el] ? this.state.availableStocks[el]["description"] : <></>}
        </td>
        <td className="rightTE" key={el + "prc"}>
          {p.trackedStockData[el] ? (
            p.trackedStockData[el]["currentPrice"] !== undefined &&
            p.trackedStockData[el]["currentPrice"].toLocaleString(undefined, {
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
              p.updateGlobalStockList(e, el);
            }}
          >
            <i className="fa fa-times" aria-hidden="true"></i>
          </button>
        </td>
      </tr>
      )
    );

    return <>{stockListKey}</>;
  }

  fileUploadAction() {
    this.inputReference.current.click();
    console.log("upload action")
  }
  
  fileUploadInputChange(e){
    const that = this
    Papa.parse(e.target.files[0], {
      complete: function(results) {
        for (const stock in results.data) {
          if (results.data[stock][1] !== undefined) {
            const thisStock = results.data[stock][0].toUpperCase() + '-' + results.data[stock][1].toUpperCase()
            const thisSymbol = results.data[stock][1].toUpperCase()
            that.state.availableStocks[thisSymbol] !== undefined && 
            that.props.updateGlobalStockList(e, thisStock)
          }
        }
      }
    });


  }

  render() {
    
    return (
      <>
        {this.props.showEditPane === 1 && (
          <>
          {React.createElement(StockSearchPane, searchPaneProps(this))}
          <div>
            <input type="file" hidden ref={this.inputReference} onChange={this.fileUploadInputChange} />
            <button className="ui button" onClick={this.fileUploadAction}>
                Stock List CSV
            </button>
            {`<--Market,Symbol /nl`} 
          </div>

          </>
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
    showPane: that.props.showPane,
    trackedStockData: that.props.trackedStockData,
    updateGlobalStockList: that.props.updateGlobalStockList,
    updateWidgetStockList: that.props.updateWidgetStockList,
    widgetKey: key,
    throttle: that.props.throttle,
    exchangeList: that.props.exchangeList,
    defaultExchange: that.props.defaultExchange,
    updateDefaultExchange: that.props.updateDefaultExchange,
  };
  return propList;
}

export default WatchListMenu;
