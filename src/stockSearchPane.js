import React from "react";
import StockDataList from "./stockDataList.js";

//compnoent used when searching for a stock via "Add stock to watchlist" on top bar or any widget searches.
class StockSearchPane extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputText: "",
      availableStocks: {},
      filteredStocks: [],
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    // console.log("mounted");
    this.getSymbolList();
  }

  handleChange(e) {
    let newSearch = e.target.value.toUpperCase();
    this.setState({ inputText: e.target.value.toUpperCase() });
    let newFilteredList = [];
    let availableStockCount = this.state.availableStocks.length;

    for (let resultCount = 0, filteredCount = 0; resultCount < 20 && filteredCount < availableStockCount; filteredCount++) {
      if (this.state.availableStocks[filteredCount].includes(newSearch) === true) {
        resultCount = resultCount + 1;
        newFilteredList.push(this.state.availableStocks[filteredCount]);
      }
      this.setState({ filteredStocks: newFilteredList });
    }
  }

  getSymbolList() {
    fetch("https://finnhub.io/api/v1/stock/symbol?exchange=US&token=" + this.props.apiKey)
      .then((response) => response.json())
      .then((data) => {
        let transformData = [];
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
          transformData.push(c + ": " + b);

        }
        
        this.setState({ availableStocks: transformData });
        console.log("Success retrieving stock symbols");
      })
      .catch((error) => {
        console.error("Error retrieving stock symbols", error);
      });
  }

  render() {
    let widgetKey = this.props.widgetKey;
    let stockSymbol = this.state.inputText.slice(0, this.state.inputText.indexOf(":"));

    return (
      <div className="stockSearch">
        <form
          className="form-inline"
          onSubmit={(e) => {
            if (this.state.availableStocks.includes(this.state.inputText)) {
              // console.log(this.props.availableStocks[e]);
              this.props.updateGlobalStockList(e, this.state.inputText);
              this.props.showSearchPane();
              this.props.getStockPrice(this.state.inputText);
              if (widgetKey / 1 !== undefined) {
                this.props.updateWidgetStockList(widgetKey, stockSymbol);
              }
            } else {
              //console.log(this.state.inputText);
              alert("invalid stock selection");
            }
          }}
        >
          <label htmlFor="stockSearch">Search For Stock Symbol: </label>
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
