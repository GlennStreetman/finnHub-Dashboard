import React from "react";
import StockDataList from "./stockDataList.js";

//compnoent used when searching for a stock via "Add stock to watchlist" on top bar or any widget searches.
class StockSearchPane extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputText: "",
      availableStocks: {}, //formatted stock list returned from finhubb
      filteredStockObjects: {}, //object data for each stock selected
      filteredStocks: [], //short list of stocks selected
      // exchanges:['US','T','SS','HK','AS','BR','LS','PA','SZ','L'],  //Premium account required to receive stock data for none US exchanges.  
      exchanges:['US'],   //NYSE
    };
    this.handleChange = this.handleChange.bind(this);
    this.getSymbolList = this.getSymbolList.bind(this);
  }

  componentDidMount() {
    // console.log("mounted");
    let exchange = this.state.exchanges
    for (const x in exchange) {
      this.getSymbolList(exchange[x]);
    }
  }



  handleChange(ev=1) {
    ev.target !== undefined && this.setState({ inputText: ev.target.value.toUpperCase() });
    
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
          if (stockSearchPhrase.includes(this.state.inputText) === true && stockListObject[stockList[filteredCount]]['type'] === 'EQS') {
            resultCount = resultCount + 1;
            newFilteredList.push(stockSearchPhrase);
            filterObject[stockList[filteredCount]] = stockListObject[stockList[filteredCount]] 
          }
          this.setState({filteredStockObjects: filterObject})
          this.setState({ filteredStocks: newFilteredList });
          
        }
  }

  getSymbolList(exchange) {
    let that = this
    this.props.throttle(function() { 
      fetch(`https://finnhub.io/api/v1/stock/symbol?exchange=${exchange}&token=${that.props.apiKey}`)
        .then((response) => response.json())
        .then((data) => {
          let updateStockList = Object.assign({}, data)
          for (const key in updateStockList) {
            let addStockData = updateStockList[key]
            let addStockKey = exchange + "-" + updateStockList[key]['symbol']
            updateStockList[addStockKey] = addStockData
            delete updateStockList[key]
          }
          // let list = Object.assign({}, that.state.availableStocks ,updateStockList)
          that.setState({ availableStocks: Object.assign({}, that.state.availableStocks ,updateStockList)});
          console.log("Success retrieving stock symbols:" + exchange);
        })
        .catch((error) => {
          console.error("Error retrieving stock symbols:" +  exchange);
        });
      })
  }

  render() {
    let widgetKey = this.props.widgetKey;
    let stockSymbol = this.state.inputText.slice(0, this.state.inputText.indexOf(":"));

    return (
      <div className="stockSearch">
        <form
          className="form-inline"
          onSubmit={(e) => {
            if (this.state.filteredStocks.includes(this.state.inputText)) {
              let stockKey = this.state.inputText.slice(0, this.state.inputText.indexOf(":") )
              this.props.updateGlobalStockList(e, stockKey ,this.state.filteredStockObjects[stockKey]);
              this.props.showSearchPane();
              this.props.getStockPrice(this.state.inputText);
              if (widgetKey / 1 !== undefined) {
                this.props.updateWidgetStockList(widgetKey, stockSymbol);
              }
            } else {
              //console.log(this.state.inputText);
              console.log("invalid stock selection");
            }
          }}
        >
          <label htmlFor="stockSearch">Symbol: </label>
          <input autoComplete="off" className="btn" type="text" id="stockSearch" list="stockSearch1" value={this.state.inputText} onChange={this.handleChange} />
          {/* <datalist id="stockSearch1">{this.createDataList()}</datalist> */}
          <datalist id="stockSearch1">
            <StockDataList availableStocks={this.state.filteredStocks} />
          </datalist>
          <input className="btn" type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}

export default StockSearchPane;
