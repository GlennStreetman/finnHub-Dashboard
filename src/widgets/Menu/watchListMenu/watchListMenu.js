import Papa from 'papaparse'
import React from "react";
import StockSearchPane, {searchPaneProps} from "../../../components/stockSearchPane.js";

class WatchListMenu extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      availableStocks: {},
    };

    this.inputReference = React.createRef();
    this.baseState = {mounted: true}
    this.renderWatchedStocks = this.renderWatchedStocks.bind(this);
    this.fileUploadAction = this.fileUploadAction.bind(this);
    this.fileUploadInputChange = this.fileUploadInputChange.bind(this);
    this.returnKey = this.returnKey.bind(this);
  }

  componentWillUnmount(){
    this.baseState.mounted = false
  }

  componentDidMount() {

  }

  returnKey(ref){
    const retVal = ref !== undefined ? ref["currentPrice"] : "noDat"
    return retVal
  }

  renderWatchedStocks() {
      
    const p = this.props
    const g = p.globalStockList;
    if (g.sKeys !== undefined) {
    // console.log(g, '-------------')
    const stockListKey = g.sKeys().map((el) => ( 
    <tr key={el + "row"}>
        <td key={el + "desc"}>
          {g[el].dStock(p.exchangeList) + ": "}
          {this.state.availableStocks[el] ? this.state.availableStocks[el]["description"] : <></>}
        </td>
        <td className="rightTEFade" key={el + "prc" + this.returnKey(p.streamingPriceData[el])}>
          {p.streamingPriceData[el] ? (
            p.streamingPriceData[el]["currentPrice"] !== undefined &&
            p.streamingPriceData[el]["currentPrice"].toLocaleString(undefined, {
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
  } else {
    return <></>
  }

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
          console.log(results.data, stock)
          if (results.data[stock][1] !== undefined) {
            
            const thisStock = results.data[stock][0].toUpperCase() + '-' + results.data[stock][1].toUpperCase()
            console.log(thisStock, that.state.availableStocks[thisStock])
            // const thisSymbol = results.data[stock][1].toUpperCase()
            that.state.availableStocks[thisStock] !== undefined && 
            that.props.updateGlobalStockList(e, thisStock, that.state.availableStocks[thisStock])
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
    // searchText: that.state.searchText,
    // changeSearchText: that.changeSearchText,
    globalStockList: that.props.globalStockList,
    showPane: that.props.showPane,
    streamingPriceData: that.props.streamingPriceData,
    updateGlobalStockList: that.props.updateGlobalStockList,
    updateWidgetStockList: that.props.updateWidgetStockList,
    widgetKey: key,
    throttle: that.props.throttle,
    exchangeList: that.props.exchangeList,
    defaultExchange: that.props.defaultExchange,
    updateDefaultExchange: that.props.updateDefaultExchange,
  };
  // console.log("watchlistmenu", that, propList)
  return propList;
}

export default WatchListMenu;
