import React, { Component } from 'react'
import StockSearchPane, {searchPaneProps} from "../../../components/stockSearchPane.js";
import {finnHub} from "../../../appFunctions/throttleQueue.js";
import {dStock} from "../../../appFunctions/formatStockSymbols.js";

export default class PriceTargetBody extends Component {
  constructor(props) {
    super(props);
    this.state = {
      targetData: [],
      targetStock: '',
    };

    this.baseState = {mounted: true}
    this.renderSearchPane = this.renderSearchPane.bind(this);
    this.renderStockData = this.renderStockData.bind(this);
    this.getStockData = this.getStockData.bind(this);
    this.updateFilter = this.updateFilter.bind(this);
    this.getStockName = this.getStockName.bind(this);
    this.changeStockSelection = this.changeStockSelection.bind(this);
    }

    componentDidMount(){
      const p = this.props
      p.trackedStocks.key()[0] !== undefined && this.setState({targetStock: p.trackedStocks.key()[0]}, () => this.getStockData()) 
    }

    componentDidUpdate(prevProps, prevState){
      const p = this.props
      if (prevProps.trackedStocks[0] !== p.trackedStocks[0]) {
        this.setState({targetStock: p.trackedStocks.key()[0]}, () => this.getStockData())
      }
    }

    componentWillUnmount(){
      this.baseState.mounted = false
    }

    changeStockSelection(e) {
      const target = e.target.value;
      this.setState({ targetStock: target }, () => this.getStockData());
    }

    updateFilter(e) {
      //e should be click event.
      this.props.updateWidgetFilters(this.props.widgetKey, "filterName", e)
    }

    getStockName(stock){
      const s = this.state
      try {
        const stockName = s.availableStocks[stock]['description']
        return stockName
      } catch {
        // console.log('cant find stock', stock)
        return " " 
      }
    }

    renderSearchPane(){
      //add search pane rendering logic here. Additional filters need to be added below.
    const p = this.props
    const stockList = p.trackedStocks.key();
    const stockListRows = stockList.map((el) =>
        <tr key={el + "container"}>
          <td key={el + "name"}>{p.trackedStocks[el].dStock(p.exchangeList)}</td>
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
      )

    let stockTable = (
      <table>
        <tbody>{stockListRows}</tbody>
      </table>
    );
    return stockTable
    }


    renderStockData(){
      // console.log("rendering stock data")
      const s = this.state
      const p = this.props
      const stockDataRows = Object.keys(s.targetData).map((el) => 
        <tr key={el + "row"}>
          <td key={el + "symbol"}>{el}</td>
          <td key={el + "name"}>{s.targetData[el]}</td>
        </tr>
      )
      const newSymbolList = p.trackedStocks.key().map((el) => (
        <option key={el + "ddl"} value={el}>
          {dStock(el, p.exchangeList)}
        </option>
      ))
      return <>
        <select className="btn" value={this.state.targetStock} onChange={this.changeStockSelection}>
          {newSymbolList}
        </select>
        <table>
          <tbody>
            {stockDataRows}
          </tbody>
        </table>
      </>
    } 

    getStockData(){
      // console.log("getting stock data")
      const p = this.props
      const s = this.state
      const that = this
      const stockSymbol = s.targetStock.slice(s.targetStock.indexOf("-")+1, s.targetStock.length)
      const queryString = `https://finnhub.io/api/v1/stock/price-target?symbol=${stockSymbol}&token=${p.apiKey}`
      // console.log(queryString)
      finnHub(p.throttle, queryString)
      .then((data) => {
        if (that.baseState.mounted === true) {
          // console.log(data)
          this.setState({targetData: data})
          
        }
      })
      .catch(error => {
        console.log(error.message)
      });
    }

    render() {
      const p = this.props
        return (
            <>
            {this.props.showEditPane === 1 && (
              <>
              {React.createElement(StockSearchPane, searchPaneProps(this))}
              {this.renderSearchPane()}
              </>
            )}
            {p.trackedStocks.key().length > 0 && 
            this.props.showEditPane === 0  ? this.renderStockData() : <></>}       
          </>
        )
    }
  }


export function priceTargetProps(that, key = "newWidgetNameProps") {
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
