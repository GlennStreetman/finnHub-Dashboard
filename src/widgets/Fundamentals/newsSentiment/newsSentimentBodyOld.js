import React, { Component } from 'react'
import StockSearchPane, {searchPaneProps} from "../../../components/stockSearchPane";
import EndPointNode from "../../../components/endPointNode";
import {finnHub} from "../../../appFunctions/throttleQueue";

export default class FundamentalsNewsSentiment extends Component {
    constructor(props) {
        super(props);
        this.state = {
          targetStock: '',
          stockData: {},
        };

      this.baseState = {mounted: true}
      this.renderSearchPane = this.renderSearchPane.bind(this);
      this.renderStockData = this.renderStockData.bind(this);
      this.getStockData = this.getStockData.bind(this);
      // this.mapStockData  = this.mapStockData.bind(this);
      this.changeStockSelection = this.changeStockSelection.bind(this);
      this.updateWidgetList = this.updateWidgetList.bind(this);
    }

    componentDidMount(){
      const p = this.props
      if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
        this.setState({...p.widgetCopy})
      } else {
        Object.keys(p.trackedStocks)[0] !== undefined && 
        this.setState({targetStock: Object.keys(p.trackedStocks)[0]}, () => this.getStockData()) 
      }
    }

    componentDidUpdate(prevProps, prevState){
      const p = this.props
      
      if (Object.keys(prevProps.trackedStocks)[0] === undefined && Object.keys(p.trackedStocks)[0] !== undefined) {
        this.setState({targetStock: Object.keys(p.trackedStocks)[0]}, () => this.getStockData())
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

    changeStockSelection(e) {
      const target = e.target.value;
      this.setState({ targetStock: target }, () => this.getStockData());
    }

    renderSearchPane(){
      const p = this.props
      const stockList = Object.keys(p.trackedStocks);
      let row = stockList.map((el) =>
        this.props.showEditPane === 1 ? (
          <tr key={el + "container"}>
            <td key={el + "name"}>{p.trackedStocks[el].dStock(p.exchangeList)}</td>
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

    renderStockData(){
      const p = this.props
      const newSymbolList = Object.keys(this.props.trackedStocks).map((el) => (
        <option key={el + "ddl"} value={el}>
          {p.trackedStocks[el].dStock(p.exchangeList)}
        </option>
      ))
      
  
      const stockTable = 
        <>
        <select className="btn" value={this.state.targetStock} onChange={this.changeStockSelection}>
          {newSymbolList}
        </select>
        <br />
        <EndPointNode nodeData={this.state.stockData} />
        </>
    return stockTable
    }

    getStockData(){
      if (this.state.targetStock !== undefined) {
        const p = this.props
        const that = this
        const stock = this.state.targetStock
        if (stock.slice(0, stock.indexOf('-')) === 'US') {
          const thisStock = stock.slice(stock.indexOf('-') + 1, stock.length)
          const queryString = `https://finnhub.io/api/v1/news-sentiment?symbol=${thisStock}&token=${p.apiKey}`
          finnHub(p.throttle, queryString)
          .then((data) => {
            if (that.baseState.mounted === true) {
              if (data.error === 429) { //run again
                this.getStockData(stock)
              } else if (data.error === 401) {
                console.log("Problem with API key access.")
                // p.throttle.resetQueue()
                // p.updateAPIFlag(2)
              } else {
                this.setState({stockData: data})
              }
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


export function newsSentimentsProps(that, key = "newWidgetNameProps") {
    let propList = {
      apiKey: that.props.apiKey,
      showPane: that.showPane,
      trackedStocks: that.props.widgetList[key]["trackedStocks"],
      filters: that.props.widgetList[key]["filters"],
      updateWidgetFilters: that.props.updateWidgetFilters,
      updateGlobalStockList: that.props.updateGlobalStockList,
      updateWidgetStockList: that.props.updateWidgetStockList,
      widgetKey: key,
      exchangeList: that.props.exchangeList,
      defaultExchange: that.props.defaultExchange,
      updateDefaultExchange: that.props.updateDefaultExchange,
    };
    return propList;
  }