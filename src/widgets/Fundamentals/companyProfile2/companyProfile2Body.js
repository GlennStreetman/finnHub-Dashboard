import React, { Component } from 'react'
import StockSearchPane, {searchPaneProps} from "../../../components/stockSearchPane.js";
import {finnHub} from "../../../appFunctions/throttleQueue.js";
import {dStock} from "../../../appFunctions/formatStockSymbols.js";

export default class FundamentalsCompanyProfile2 extends Component {
  constructor(props) {
      super(props);
      this.state = {
          stockData: {},
          targetStock: ''
      };
    
    this.baseState = {mounted: true}
    this.renderSearchPane = this.renderSearchPane.bind(this);
    this.renderStockData = this.renderStockData.bind(this);  
    this.getStockData = this.getStockData.bind(this); 
    this.mapStockData  = this.mapStockData.bind(this);
    this.stockListForm =  this.stockListForm.bind(this);
    this.editWidgetStockList =  this.editWidgetStockList.bind(this);
    this.changeStockSelection = this.changeStockSelection.bind(this);
  }

  componentDidMount(){
    const p = this.props
    console.log('getting stock data')
    this.setState({targetStock: p.trackedStocks[0]}, () => this.getStockData())
    
  }

  componentDidUpdate(prevProps, prevState){
    const p = this.props
    if (prevState.targetStock !== this.state.targetStock) {
      this.getStockData()
    }
    if (prevProps.trackedStocks[0] !== p.trackedStocks[0]) {
      this.setState({targetStock: p.trackedStocks[0]}, () => this.getStockData())
    }
  }

  componentWillUnmount(){
    this.baseState.mounted = false
  }

  changeStockSelection(e) {
    const target = e.target.value;
    this.setState({ targetStock: target });
  }

  editWidgetStockList(stock) {
    if (stock.indexOf(":") > 0) {
      const stockSymbole = stock.slice(0, stock.indexOf(":"));
      this.props.updateWidgetStockList(this.props.widgetKey, stockSymbole);
    } else {
      this.props.updateWidgetStockList(this.props.widgetKey, stock);
    }
  }

  renderSearchPane(){ 
    return <>
      {this.stockListForm()}
    </>
  }

  stockListForm() {
    let stockList = this.props.trackedStocks;
    const p = this.props
    let row = stockList.map((el) =>
      this.props.showEditPane === 1 ? (
        <tr key={el + "container"}>
          <td key={el + "name"}>{dStock(el, p.exchangeList)}</td>
          <td key={el + "buttonC"}>
            <button
              key={el + "button"}
              onClick={() => {
                this.editWidgetStockList(el);
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
    return stockListTable;
  }

  renderStockData(){
    const p = this.props
    const newSymbolList = this.props.trackedStocks.map((el) => (
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
        <table>
          <thead>
            <tr>
              <td>Key</td>
              <td>Value</td>
            </tr>
          </thead>
          <tbody>
            {this.mapStockData()}
          </tbody>
        </table>
      </>
  return stockTable
  }

  mapStockData(){
      const s = this.state
      const rows = Object.keys(s.stockData).map((key) => 
        <tr key={s.stockData[key]}>
          <td>{ `${key}: `}</td>
          {/* <td>{s.stockData[key]}</td> */}
          <td>
            {key === 'logo' ? <img width='25%' src={s.stockData[key]}  alt={s.stockData[key]}></img> :  s.stockData[key]}
          </td>
        </tr>
      )
    return rows
  }

    getStockData(){
      if (this.state.targetStock !== undefined){
      console.log("--------getting stocks data")
      const stock = this.state.targetStock
        if (stock.slice(0, stock.indexOf('-')) === 'US') {
          const thisStock = stock.slice(stock.indexOf('-') + 1, stock.length)
          const p = this.props
          const that = this
          const queryString = `https://finnhub.io/api/v1/stock/profile2?symbol=${thisStock}&token=${p.apiKey}`
          console.log(queryString)
          finnHub(p.throttle, queryString)
          .then((data) => {
            if (this.baseState.mounted === true) {
              that.setState({stockData: Object.assign({}, data)})
            }
          })
          .catch(error => {
            console.log(error.message)
          });
        }
      }
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

export function companyProfile2Props(that, key = "companyProfile2Props") {
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