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
    this.submitSecurity = this.submitSecurity.bind(this)
  }

  componentDidMount(){
    const p = this.props
    if (p.defaultExchange !== p.currentExchange){
      p.tGetSymbolList({exchange: p.defaultExchange, apiKey: p.apiKey, finnHubQueue: p.finnHubQueue})
    }
  }

  handleChange(e) {
    const p = this.props
    p.changeSearchText(e.target.value.toUpperCase())
  }

  changeDefault(event){
    this.props.updateDefaultExchange(event.target.value, true)
    event.preventDefault()
  }

  submitSecurity(e){
    let widgetKey = this.props.widgetKey;
    if (this.props.rUpdateStock !== undefined && widgetKey === 'watchListMenu') {
      const thisStock = this.props.rUpdateStock
      const stockKey = thisStock.key
      console.log('FIRING FROM SEARCHPANE')
      this.props.updateGlobalStockList(e, stockKey, thisStock);
      // this.props.showSearchPane();
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
  }
  
  render() { // inputText

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

    const syncText = <>
    Set all widgets security list equal to Watchlist Menu security list.<br />
    Also useful after copying a dashboard and quickly updating all widgets with new security list. <br />
    </>

    const watchListSync = 
      <>
        <button className="ui button" name='other' onClick={this.props.syncGlobalStockList}>
              Sync
        </button>
        <ToolTip textFragment={syncText} hintName='sw' /> <br />
      </>

    return (
      <div className="stockSearch">
        <form
          className="form-stack"
          onSubmit={(e) => { //submit stock to be added/removed from global & widget stocklist.
            console.log('e', e)
            e.preventDefault()
            // if (this.props.rUpdateStock !== undefined && widgetKey === 'watchListMenu') {
            //   const thisStock = this.props.rUpdateStock
            //   const stockKey = thisStock.key
            //   console.log('FIRING FROM SEARCHPANE')
            //   this.props.updateGlobalStockList(e, stockKey, thisStock);
            //   // this.props.showSearchPane();
            //   e.preventDefault();
            // } else if (widgetKey / 1 !== undefined && this.props.rUpdateStock !== undefined) { //Not menu widget. Menus named, widgets numbered.
            //   const thisStock = this.props.rUpdateStock
            //   const stockKey = thisStock.key
            //   this.props.updateWidgetStockList(widgetKey, stockKey, thisStock);
            //   e.preventDefault();
            
            // } else {
            //   console.log("invalid stock selection");
            //   e.preventDefault();
            // }
          }}
        >
          {this.props.exchangeList.length > 1 && <>
            <ToolTip textFragment={helpText} hintName='sspe' />
          <label htmlFor="exchangeList">Exchange: </label>
          <select value={this.props.defaultExchange} name='exchangeList' onChange={this.changeDefault}>
            {exchangeOptions}
          </select></>
          } 

          <ToolTip textFragment={helpText2} hintName='sspe2' />
          <label htmlFor="stockSearch">Security: </label>
          <input size='18' autoComplete="off" className="btn" type="text" id="stockSearch" list={`${this.props.widgetKey}-dataList`} value={this.state.inputText} onChange={this.handleChange} />
          <datalist id={`${this.props.widgetKey}-dataList`}>
            <StockDataList  
              defaultExchange={this.props.defaultExchange}
              inputText={this.props.searchText}
            />
          </datalist>
          <button className="btn" type="other" value="Submit" onClick={this.submitSecurity}>Submit</button>
          {this.props.widgetKey === 'watchListMenu' && watchListSync}
        </form>

      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {

  const p = ownProps

  const thisExchange = state.exchangeData.e?.data
  const inputSymbol = p.searchText.slice(0, p.searchText.indexOf(":"))
  const updateStock = thisExchange !== undefined ? thisExchange[inputSymbol] : {}
  const currentExchange = state.exchangeData.e.ex
  return {
    rUpdateStock: updateStock,
    currentExchange: currentExchange,
  }
}
export default connect(mapStateToProps, {tGetSymbolList})(StockSearchPane);

export function searchPaneProps(that) {
  const propList = {
    updateGlobalStockList: that.props.updateGlobalStockList,
    updateWidgetStockList: that.props.updateWidgetStockList,
    widgetKey: that.props.widgetKey,
    exchangeList: that.props.exchangeList,
    defaultExchange: that.props.defaultExchange,
    updateDefaultExchange: that.props.updateDefaultExchange,
    searchText: that.props.searchText,
    changeSearchText: that.props.changeSearchText,
    apiKey: that.props.apiKey,
    finnHubQueue: that.props.finnHubQueue,
    syncGlobalStockList: that.props.syncGlobalStockList,
  };
  return propList;
}
  