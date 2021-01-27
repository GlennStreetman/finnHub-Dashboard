import React from "react";
import StockDataList from "./stockDataList.js";
import { connect } from "react-redux";
import ToolTip from './toolTip.js'
//compnoent used when searching for a stock via "Add stock to watchlist" on top bar or any widget searches.
class StockSearchPane extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // inputText: "",
      // availableStocks: {}, //formatted stock list returned from finhubb
      // filteredStocks: [], //short list of stocks selected
    };
    this.handleChange = this.handleChange.bind(this);
    this.changeDefault = this.changeDefault.bind(this);
  }

  handleChange(e) {
    const p = this.props
    p.changeSearchText(e.target.value.toUpperCase())
  }

  changeDefault(event){
    this.props.updateDefaultExchange(event)
  }
  
  render() { // inputText
    const p = this.props
    let widgetKey = p.widgetKey;
    const exchangeOptions = this.props.exchangeList.map((el) => 
      <option key={el} value={el}>{el}</option>
    )
    const helpText = <>
        'Click manage account to update manage exchange list.' <br />
        'Enter stock name or symbol to right to search for stocks to add to watchlist.'
      </>

    return (
      <div className="stockSearch">
        <form
          className="form-inline"
          onSubmit={(e) => { //submit stock to be added/removed from global & widget stocklist.
            if (this.props.rUpdateStock !== undefined && widgetKey === 'WatchListMenu') {
              const stockKey = this.props.rUpdateStock.key
              this.props.updateGlobalStockList(e, stockKey, this.props.rUpdateStock);
              this.props.showSearchPane();
            } else if (widgetKey / 1 !== undefined) { //Not menu widget. Menus named, widgets numbered.
              const stockKey = this.props.rUpdateStock.key
              this.props.updateWidgetStockList(widgetKey, stockKey, this.props.rUpdateStock);
              e.preventDefault();
            
            } else {
              console.log("invalid stock selection");
              e.preventDefault();
            }
          }}
        >
          {this.props.exchangeList.length > 1 && <>
            <ToolTip textFragment={helpText} hintName='sspe' />
          <label htmlFor="exchangeList">Exchange: </label>
          <select value={this.props.defaultExchange} name='exchangeList' onChange={this.changeDefault}>
            {exchangeOptions}
          </select></>
          }
          <label htmlFor="stockSearch">Symbol: </label>
          <input size='40' autoComplete="off" className="btn" type="text" id="stockSearch" list="stockSearch1" value={this.state.inputText} onChange={this.handleChange} />
          <datalist id="stockSearch1">
            <StockDataList 
              // availableStocks={this.state.filteredStocks} 
              defaultExchange={this.props.defaultExchange}
              inputText={this.props.searchText}
            />
          </datalist>
          <input className="btn" type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  // console.log("OWNPROPS:", ownProps)
  const p = ownProps
  const inputSymbol = p.defaultExchange + "-" + p.searchText.slice(0, p.searchText.indexOf("-"))
  const updateStock = state.exchangeData[p.defaultExchange] ? state.exchangeData[p.defaultExchange][inputSymbol] : {}

  return {
    rUpdateStock: updateStock,
  }
}

export default connect(mapStateToProps)(StockSearchPane);

export function searchPaneProps(that) {
  const propList = {
    updateGlobalStockList: that.props.updateGlobalStockList,
    showSearchPane: () => that.props.showPane("showEditPane", 1),
    apiKey: that.props.apiKey,
    updateWidgetStockList: that.props.updateWidgetStockList,
    widgetKey: that.props.widgetKey,
    throttle: that.props.throttle,
    exchangeList: that.props.exchangeList,
    defaultExchange: that.props.defaultExchange,
    updateDefaultExchange: that.props.updateDefaultExchange,
    searchText: that.props.searchText,
    changeSearchText: that.props.changeSearchText,
  };
  return propList;
}
  