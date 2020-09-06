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
    };
    this.handleChange = this.handleChange.bind(this);
    // this.createDataList = this.createDataList.bind(this);
  }
  //updates text in search box with uppercase on each keypress.
  handleChange(e) {
    this.setState({ inputText: e.target.value.toUpperCase() });
  }

  render() {
    return (
      <div className="stockSearch">
        <form
          className="form-inline"
          onSubmit={(e) => {
            if (this.props.availableStocks[this.state.inputText.slice(0, this.state.inputText.indexOf(":"))]) {
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
            <StockDataList availableStocks={this.props.availableStocks} />
          </datalist>
          <input type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}

export default StockSearchPane;
