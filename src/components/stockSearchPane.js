import React from "react";
import StockDataList from "./stockDataList.js";
import {finnHub} from "../appFunctions/throttleQueue.js";
//compnoent used when searching for a stock via "Add stock to watchlist" on top bar or any widget searches.
class StockSearchPane extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputText: "",
      availableStocks: {}, //formatted stock list returned from finhubb
      filteredStocks: [], //short list of stocks selected
    };
    this.baseState = {mounted: true}
    this.handleChange = this.handleChange.bind(this);
    this.getSymbolList = this.getSymbolList.bind(this);
    this.changeDefault = this.changeDefault.bind(this);
  }

  componentDidMount() {
    this.getSymbolList(this.props.defaultExchange)
  }

  componentDidUpdate(prevProps) {
    if (this.props.defaultExchange !== prevProps.defaultExchange) {
      this.getSymbolList(this.props.defaultExchange)
    }
  }

  componentWillUnmount(){
    this.baseState.mounted = false
  }

  handleChange(e) {
    e.target !== undefined && this.setState({ inputText: e.target.value.toUpperCase() });
    console.log("returning new dropdown list")
    let filterObject = {}
    let newFilteredList = [];

    let availableStockCount = Object.keys(this.state.availableStocks).length;
    let stockList = Object.keys(this.state.availableStocks)
    let stockListObject = this.state.availableStocks
    //limit autofill to 20 results
    for (let resultCount = 0, filteredCount = 0; 
        resultCount < 20 && filteredCount < availableStockCount; 
        filteredCount++) {
          let stockSearchPhrase = stockList[filteredCount] + ': ' + stockListObject[stockList[filteredCount]]['description'].toUpperCase()
          if (stockSearchPhrase.includes(this.state.inputText) === true) {
            resultCount = resultCount + 1;
            newFilteredList.push(stockSearchPhrase);
            filterObject[stockList[filteredCount]] = stockListObject[stockList[filteredCount]] 
          }
          // this.setState({filteredStockObjects: filterObject})
          this.setState({ filteredStocks: newFilteredList });
          
        }
  }

      getSymbolList(exchange) { //new
        let that = this
        // console.log("getting listings for exchange:", exchange )
        const apiString = `https://finnhub.io/api/v1/stock/symbol?exchange=${exchange}&token=${that.props.apiKey}`
          finnHub(this.props.throttle, apiString)  
          .then((data) => {
            if (this.baseState.mounted === true) {
              let updateStockList = {}
              for (const stockObj in data) {
                data[stockObj]['exchange'] = exchange
                let addStockKey = exchange + "-" + data[stockObj]['symbol']
                updateStockList[addStockKey] = data[stockObj]
                updateStockList[addStockKey]['key'] = addStockKey
                //return exchange + stock symbol if more than one exchange selected
                updateStockList[addStockKey]['dStock'] = function(ex){
                  if (ex.length === 1) {
                    return (this.symbol)
                  } else {
                    return (this.key)
                  }
                }

                updateStockList[addStockKey]['keys'] = function(){
                  return Object.keys(this)
                }

              }
              that.setState({ availableStocks: updateStockList});
            }
          })
          .catch((error) => {
            console.error("Error retrieving stock symbols:" +  error);
          });
          }
     
 
  changeDefault(event){
    this.props.updateDefaultExchange(event)
  }
  
  render() {
    let s = this.state
    let widgetKey = this.props.widgetKey;
    let stockSymbol = this.state.inputText.slice(0, this.state.inputText.indexOf(":"));
    const exchangeOptions = this.props.exchangeList.map((el) => 
      <option key={el} value={el}>{el}</option>
    )

    return (
      <div className="stockSearch">
        <form
          className="form-inline"
          onSubmit={(e) => {
            if (this.state.filteredStocks.includes(this.state.inputText)) {
              let stockKey = this.state.inputText.slice(0, this.state.inputText.indexOf(":") )
              // this.props.updateGlobalStockList(e, stockKey ,this.state.filteredStockObjects[stockKey]);
              // console.log('---------->',s.availableStocks.[stockKey])
              this.props.updateGlobalStockList(e, stockKey, s.availableStocks[stockKey]);
              this.props.showSearchPane();
              if (widgetKey / 1 !== undefined) {
                this.props.updateWidgetStockList(widgetKey, stockSymbol, s.availableStocks[stockKey]);
                e.preventDefault();
              }
            } else {
              //console.log(this.state.inputText);
              console.log("invalid stock selection");
              e.preventDefault();
            }
          }}
        >
          {this.props.exchangeList.length > 1 && <>
          <label htmlFor="exchangeList">Exchange: </label>
          <select value={this.props.defaultExchange} name='exchangeList' onChange={this.changeDefault}>
            {exchangeOptions}
          </select></>
          }
          <label htmlFor="stockSearch">Symbol: </label>
          <input size='40' autoComplete="off" className="btn" type="text" id="stockSearch" list="stockSearch1" value={this.state.inputText} onChange={this.handleChange} />
          <datalist id="stockSearch1">
            <StockDataList 
              availableStocks={this.state.filteredStocks} 
              exchangeList={this.props.exchangeList}  
            />
          </datalist>
          <input className="btn" type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}

export default StockSearchPane;

export function searchPaneProps(that) {
  let propList = {
    updateGlobalStockList: that.props.updateGlobalStockList,
    showSearchPane: () => that.props.showPane("showEditPane", 1),
    apiKey: that.props.apiKey,
    updateWidgetStockList: that.props.updateWidgetStockList,
    widgetKey: that.props.widgetKey,
    throttle: that.props.throttle,
    exchangeList: that.props.exchangeList,
    defaultExchange: that.props.defaultExchange,
    updateDefaultExchange: that.props.updateDefaultExchange,
  };
  return propList;
}
