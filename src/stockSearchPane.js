import React from "react";
import StockDataList from "./stockDataList.js";

//compnent used when searching for a stock via "Add stock to watchlist" on top bar or any widget searches.
class StockSearchPane extends React.Component {
  //EXPECTED PROPS
  // availableStocks: list of all available stocks. Used to auto fill search.
  // UpdateStockTrackingList: Function updates APP stock tracking list. Runs on submit.
  // showSearchPane: Function that toggles search pane closed on submit.
  // getStockPrice: Function that updates stock detail info. Runs on submit.
  //widgetList: Info to be updated for widget.

  constructor(props) {
    super(props);
    this.state = {
      inputText: "",
      availableStocks: [],
    };
    this.handleChange = this.handleChange.bind(this);
    // this.createDataList = this.createDataList.bind(this);
  }
  //updates text in search box with uppercase on each keypress.

  componentDidMount() {
    this.getSymbolList();
  }

  handleChange(e) {
    this.setState({ inputText: e.target.value.toUpperCase() });
  }

  getSymbolList() {
    fetch("https://finnhub.io/api/v1/stock/symbol?exchange=US&token=bsuu7qv48v6qu589jlj0")
      .then((response) => response.json())
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
        this.setState({ availableStocks: transformData });
        // console.log("Success retrieving stock symbols");
      })
      .catch((error) => {
        console.error("Error retrieving stock symbols", error);
      });
  }

  render() {
    return (
      <div className="stockSearch">
        <form
          className="form-inline"
          onSubmit={(e) => {
            if (this.state.availableStocks[this.state.inputText.slice(0, this.state.inputText.indexOf(":"))]) {
              //console.log(this.props.availableStocks[e]);
              this.props.UpdateStockTrackingList(e, this.state.inputText);
              // this.props.showSearchPane();
              this.props.getStockPrice(this.state.inputText);
              if (this.props.updateWidgetList) {
                this.props.updateWidgetList(this.state.inputText);
              }
            } else {
              //console.log(this.state.inputText);
              alert("invalid stock selection");
            }
          }}
        >
          <label htmlFor="stockSearch">Search For Stock Symbol: </label>
          <input type="text" id="stockSearch" list="stockSearch1" value={this.state.inputText} onChange={this.handleChange} />
          {/* <datalist id="stockSearch1">{this.createDataList()}</datalist> */}
          <datalist id="stockSearch1">
            <StockDataList availableStocks={this.state.availableStocks} />
          </datalist>
          <input type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}

export default StockSearchPane;
