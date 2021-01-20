import React, { Component } from 'react'
import StockSearchPane, {searchPaneProps} from "../../../components/stockSearchPane.js";
import {finnHub} from "../../../appFunctions/throttleQueue.js";
import {dStock, sStock} from "../../../appFunctions/formatStockSymbols.js";
// import EndPointNode from "../../../components/endPointNode.js";

export default class FundamentalsSECFilings extends Component {
    constructor(props) {
        super(props);
        this.state = {
          targetStock: '',
          stockData: undefined, //list
          pageinationInt: 0,
          
        };

      this.baseState = {mounted: true}
      this.renderSearchPane = this.renderSearchPane.bind(this);
      this.renderStockData = this.renderStockData.bind(this);
      this.getStockData = this.getStockData.bind(this);
      this.updateFilter = this.updateFilter.bind(this);
      this.changeIncrement = this.changeIncrement.bind(this);
      this.changeStockSelection = this.changeStockSelection.bind(this);
      this.stockTable = this.stockTable.bind(this);
      this.formatURLS = this.formatURLS.bind(this);
    }

    componentDidMount(){
      const p = this.props
      p.trackedStocks.sKeys()[0] !== undefined && this.setState({targetStock: p.trackedStocks.sKeys()[0]}, ()=>this.getStockData()) 

    }

    componentDidUpdate(prevProps, prevState){
      const p = this.props
      
      if (prevProps.trackedStocks.sKeys()[0] === undefined && p.trackedStocks.sKeys()[0] !== undefined) {
        this.setState({targetStock: p.trackedStocks.sKeys()[0]}, () => this.getStockData())
      }
    }

    componentWillUnmount(){
      this.baseState.mounted = false
    }

    updateFilter(e) {
      //e should be click event.
      this.props.updateWidgetFilters(this.props.widgetKey, "filterName", e)
    }

    renderSearchPane(){
      const p = this.props
      let stockList = p.trackedStocks.sKeys();
      let row = stockList.map((el) =>
        this.props.showEditPane === 1 ? (
          <tr key={el + "container"}>
            <td key={el + "name"}>{dStock(el, p.exchangeList)}</td>
            <td key={el + "buttonC"}>
              <button
                key={el + "button"}
                onClick={() => {
                  p.updateWidgetStockList(p.widgetKey, el);
                }}
              >
                <i className="fa fa-times" aria-hidden="true" key={el + "icon"}></i>
              </button>
            </td>
          </tr>
        ) : (
          <tr key={el + "pass"}></tr>
        )
      );
      let stockListTable = (
        <table>
          <tbody>{row}</tbody>
        </table>
      );
      return <>{stockListTable}</>;
    }

    changeIncrement(e) {
      const newpageinationInt = this.state.pageinationInt + e;
      if (newpageinationInt > 0 && newpageinationInt < 251) this.setState({ pageinationInt: newpageinationInt });
    }

    changeStockSelection(e) {
      const target = e.target.value;
      this.setState({ targetStock: target }, ()=> this.getStockData());
      this.setState({ pageinationInt: 0 });
    }

    formatURLS(e){
      if (e.includes("http")){
        return <a href={e} target="_blank" rel="noopener noreferrer">{e.slice(0,21) + '...'}</a>
      } else return e
    }

    stockTable(data){
      // console.log(data, '<--------')
      if (data !== undefined) {
      let tableData = Object.keys(data).map((el)=>
        <tr key={"row" + el}>
          <td key={"heading" + el}>{el}</td>
          <td key={"value" + el}>{this.formatURLS(data[el])}</td>
        </tr>
      )
      return tableData
    } else {
      return <></>
    }
      
    }

    renderStockData(){
      
      const p = this.props
      const s = this.state
      if (s.stockData !== undefined) {
      let newSymbolList = p.trackedStocks.sKeys().map((el) => (
        <option key={el + "ddl"} value={el}>
          {dStock(el, p.exchangeList)}
        </option>
      ));
        
      let currentFiling = s.stockData[s.pageinationInt]
      let symbolSelectorDropDown = (
        <>
          <div>
            <select value={this.state.newsSelection} onChange={this.changeStockSelection}>
              {newSymbolList}
            </select>
            <button onClick={() => this.changeIncrement(-1)}>
              <i className="fa fa-backward" aria-hidden="true"></i>
            </button>
            <button onClick={() => this.changeIncrement(1)}>
              <i className="fa fa-forward" aria-hidden="true"></i>
            </button>
          </div>
          {/* <div>{this.state.stockData !== undefined && <EndPointNode nodeData={currentFiling} />}</div> */}
          <div>
            {this.state.stockData !== undefined && 
            <table>
              <thead>
                <tr>
                  <td>Heading</td>
                  <td>Value</td>
                </tr>
              </thead>
              <tbody>{this.stockTable(currentFiling)}</tbody>
            </table> }
          </div>

        </>
      );
      return symbolSelectorDropDown;
    }
    } 

    getStockData(){
      const p = this.props
      const s = this.state
      const that = this
      const stock = sStock(s.targetStock)
      const queryString = `https://finnhub.io/api/v1/stock/filings?symbol=${stock}&token=${p.apiKey}`
      finnHub(p.throttle, queryString)
      .then((data) => {
        if (that.baseState.mounted === true) {
          //update state
          this.setState({stockData: data})
        }
      })
      .catch(error => {
        console.log(error.message)
      });
    }

    render() {
        return (
            <>
            {this.props.showEditPane === 1 && (
              <>
              {React.createElement(StockSearchPane, searchPaneProps(this))}
              {this.renderSearchPane()}
              </>
            )}
            {Object.keys(this.props.trackedStocks).length > 0 && 
            this.props.showEditPane === 0  ? this.renderStockData() : <></>}       
          </>
        )
    }
  }


export function secFilingsProps(that, key = "newWidgetNameProps") {
    let propList = {
      apiKey: that.props.apiKey,
      showPane: that.showPane,
      trackedStocks: that.props.widgetList[key]["trackedStocks"],
      filters: that.props.widgetList[key]["filters"],
      updateWidgetFilters: that.props.updateWidgetFilters,
      updateGlobalStockList: that.props.updateGlobalStockList,
      updateWidgetStockList: that.props.updateWidgetStockList,
      widgetKey: key,
      throttle: that.props.throttle,
      exchangeList: that.props.exchangeList,
      defaultExchange: that.props.defaultExchange,
      updateDefaultExchange: that.props.updateDefaultExchange,
    };
    return propList;
  }
