import React from "react";
import StockDataList from "./stockDataList";
import { connect } from "react-redux";
import ToolTip from './toolTip.js'
import { tGetSymbolList } from "./../slices/sliceExchangeData";

//compnoent used when searching for a stock via "Add stock to watchlist" on top bar or any widget searches.
class StockSearchPane extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      
    };

    this.handleChange = this.handleChange.bind(this);
    this.changeDefault = this.changeDefault.bind(this);
  }

  componentDidMount(){
    const p = this.props
    if (p.defaultExchange !== p.currentExchange){
      p.tGetSymbolList({exchange: p.defaultExchange, apiKey: p.apiKey})
    }
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
        Select Exchange to search. <br />
        Click manage account to update exchange list. 
      </>
      const helpText2 = <>
        Enter stock name or symbol to search for stocks. <br />
    </>

    return (
      <div className="stockSearch">
        <form
          className="form-stack"
          onSubmit={(e) => { //submit stock to be added/removed from global & widget stocklist.
            if (this.props.rUpdateStock !== undefined && widgetKey === 'WatchListMenu') {
              const thisStock = this.props.rUpdateStock
              const stockKey = thisStock.key
              this.props.updateGlobalStockList(e, stockKey, thisStock);
              this.props.showSearchPane();
              e.preventDefault();
            } else if (widgetKey / 1 !== undefined && this.props.rUpdateStock !== undefined) { //Not menu widget. Menus named, widgets numbered.
              const thisStock = this.props.rUpdateStock
              const stockKey = thisStock.key
              this.props.updateWidgetStockList(widgetKey, stockKey, thisStock);
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
          <br />
          <ToolTip textFragment={helpText2} hintName='sspe2' />
          <label htmlFor="stockSearch">Symbol: </label>
          <input size='18' autoComplete="off" className="btn" type="text" id="stockSearch" list="stockSearch1" value={this.state.inputText} onChange={this.handleChange} />
          <datalist id="stockSearch1">
            <StockDataList  
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

  const p = ownProps
  // console.log('EXD', state.exchangeData.exchangeData?.data)
  const thisExchange = state.exchangeData.exchangeData?.data
  const inputSymbol = p.searchText.slice(0, p.searchText.indexOf(":"))
  const updateStock = thisExchange !== undefined ? thisExchange[inputSymbol] : {}
  const currentExchange = state.exchangeData.e.ex
  return {
    rUpdateStock: updateStock,
    currentExchange: currentExchange,
  }
}

export default connect(mapStateToProps, {tGetSymbolList})(StockSearchPane);
// export default StockSearchPane;


export function searchPaneProps(that) {
  const propList = {
    updateGlobalStockList: that.props.updateGlobalStockList,
    showSearchPane: () => that.props.showPane("showEditPane", 1),
    updateWidgetStockList: that.props.updateWidgetStockList,
    widgetKey: that.props.widgetKey,
    exchangeList: that.props.exchangeList,
    defaultExchange: that.props.defaultExchange,
    updateDefaultExchange: that.props.updateDefaultExchange,
    searchText: that.props.searchText,
    changeSearchText: that.props.changeSearchText,
    apiKey: that.props.apiKey,
  };
  return propList;
}
  