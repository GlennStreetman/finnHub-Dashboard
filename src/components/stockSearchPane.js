import React from "react";
import StockDataList from "./stockDataList.js";
import { connect } from "react-redux";
import { rUpdateText } from './../slices/sliceStockSearch.js'
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
    if (e.target !== undefined) { 

      const payload = {
        'inputText': e.target.value.toUpperCase(),
      }
      // console.log(payload, '<-------payload')
      p.rUpdateText(payload)
    }
  }

  changeDefault(event){
    this.props.updateDefaultExchange(event)
  }
  
  render() { // inputText
    const p = this.props
    let widgetKey = p.widgetKey;
    // let stockSymbol = p.rInputText.slice(0, p.rInputText.indexOf(":"));
    const exchangeOptions = this.props.exchangeList.map((el) => 
      <option key={el} value={el}>{el}</option>
    )

    return (
      <div className="stockSearch">
        <form
          className="form-inline"
          onSubmit={(e) => {
            if (this.props.rUpdateStock !== undefined) {
              const stockKey = this.props.rUpdateStock.key
              this.props.updateGlobalStockList(e, stockKey, this.props.rUpdateStock);
              this.props.showSearchPane();
              if (widgetKey / 1 !== undefined) { //Not menu widget. Menus named, widgets numbered.
                console.log("stock symbol: ",stockKey )
                this.props.updateWidgetStockList(widgetKey, stockKey, this.props.rUpdateStock);
                e.preventDefault();
              }
            } else {
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
              // availableStocks={this.state.filteredStocks} 
              defaultExchange={this.props.defaultExchange}
              inputText={this.props.rInputText}
            />
          </datalist>
          <input className="btn" type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const p = ownProps
  const st = state.stockSearch.searchText
  const inputSymbol = p.defaultExchange + "-" + st.slice(0, st.indexOf("-"))
  const updateStock = state.exchangeData[p.defaultExchange][inputSymbol]

  return {
    rUpdateStock: updateStock,
    rInputText: state.stockSearch.searchText
    
  }
}

export default connect(mapStateToProps, {rUpdateText})(StockSearchPane);

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
  };
  return propList;
}
