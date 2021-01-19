import React, { Component } from 'react'
import StockSearchPane, {searchPaneProps} from "../../../components/stockSearchPane.js";
import EndPointNode from "../../../components/endPointNode.js";
import {finnHub} from "../../../appFunctions/throttleQueue.js";
import {dStock, sStock} from "../../../appFunctions/formatStockSymbols.js";

export default class FundamentalsFinancialsAsReported extends Component {
    constructor(props) {
        super(props);
        this.state = {
          targetStock: '',
          stockdata: undefined, //{}
        };

      this.baseState = {mounted: true}
      this.renderSearchPane = this.renderSearchPane.bind(this);
      this.renderStockData = this.renderStockData.bind(this);
      this.getStockData = this.getStockData.bind(this);
      this.updateWidgetList = this.updateWidgetList.bind(this);
      this.changeStockSelection = this.changeStockSelection.bind(this);
    }

    componentDidMount(){
      const p = this.props
      p.trackedStocks.key()[0] !== undefined && this.setState({targetStock: p.trackedStocks.key()[0]}, ()=>this.getStockData()) 

    }

    componentDidUpdate(prevProps, prevState){
      const p = this.props
      
      if (prevProps.trackedStocks.key()[0] === undefined && p.trackedStocks.key()[0] !== undefined) {
        this.setState({targetStock: p.trackedStocks.key()[0]}, () => this.getStockData())
      }
    }

    componentWillUnmount(){
      this.baseState.mounted = false
    }

    updateWidgetList(stock) {
      if (stock.indexOf(":") > 0) {
        const stockSymbole = stock.slice(0, stock.indexOf(":"));
        this.props.updateWidgetStockList(this.props.widgetKey, stockSymbole);
      } else {
        this.props.updateWidgetStockList(this.props.widgetKey, stock);
      }
    }

    renderSearchPane(){
      const p = this.props
      const stockList = this.props.trackedStocks.key(); 
      const row = stockList.map((el) =>
        this.props.showEditPane === 1 ? (
          <tr key={el + "container"}>
            <td key={el + "name"}>{dStock(el, p.exchangeList)}</td>
            <td key={el + "buttonC"}>
              <button
                key={el + "button"}
                onClick={() => {
                  this.updateWidgetList(el);
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

    changeStockSelection(e) {
      const target = e.target.value;
      this.setState({ targetStock: target }, () => this.getStockData());
      
    }

    renderStockData(){
      const p = this.props
      const newSymbolList = this.props.trackedStocks.key().map((el) => (
        <option key={el + "ddl"} value={el}>
          {dStock(el, p.exchangeList)}
        </option>
      ))
      
  
      const stockTable = 
        <>
        <select className="btn" value={this.state.targetStock} onChange={this.changeStockSelection}>
          {newSymbolList}
        </select>
        <br />
        {this.state.stockData !== undefined && <EndPointNode nodeData={this.state.stockData} />}
        </>
    return stockTable
    }

    getStockData(){
      const p = this.props
      const s = this.state
      const stock = sStock(s.targetStock)
      const that = this
      const queryString = `https://finnhub.io/api/v1/stock/financials-reported?symbol=${stock}&token=${p.apiKey}`
      finnHub(p.throttle, queryString)
      .then((data) => {
        if (that.baseState.mounted === true) {
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


export function financialsAsReportedProps(that, key = "financialsAsReported") {
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
