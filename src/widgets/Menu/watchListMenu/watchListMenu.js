import Papa from 'papaparse'
import React from "react";
import StockSearchPane from "../../../components/stockSearchPane.js";
import {finnHub} from "../../../appFunctions/throttleQueue.js";



class WatchListMenu extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      availableStocks: {},
    };

    this.inputReference = React.createRef();
    this.baseState = {mounted: true}
    this.getSymbolList = this.getSymbolList.bind(this);
    this.renderWatchedStocks = this.renderWatchedStocks.bind(this);
    this.fileUploadAction = this.fileUploadAction.bind(this);
    this.fileUploadInputChange = this.fileUploadInputChange.bind(this);
  }

  componentDidMount() {
    this.getSymbolList(this.baseState);
  }

  componentWillUnmount(){
    this.baseState.mounted = false
  }
  
  getSymbolList(baseState) {
    if (this.props.apiKey !== '') {  
      let that = this
      const querryString = `https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${this.props.apiKey}`
      this.props.throttle.enqueue(function() {  
      finnHub(that.props.throttle, querryString)
        .then((data) => {
          if (that.baseState.mounted === true) {
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
            if (baseState.mounted === true) {
            that.setState({ availableStocks: transformData });
            // console.log("Success retrieving stock symbols");
            }
          }
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
          <StockSearchPane
            updateWidgetStockList={this.props.updateWidgetStockList}
            widgetKey={this.props.widgetKey}
            updateGlobalStockList={this.props.updateGlobalStockList}
            showSearchPane={() => this.props.showPane("showEditPane", 1)}
            apiKey={this.props.apiKey}
            throttle={this.props.throttle}
          />
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
  };
  return propList;
}

export default WatchListMenu;
