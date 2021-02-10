import React, { Component } from 'react'
import StockSearchPane, {searchPaneProps} from "../../../components/stockSearchPane.js";
import {finnHub} from "../../../appFunctions/throttleQueue.js";

export default class FundamentalsPeers extends Component {
    constructor(props) {
        super(props);
        this.state = {
          peersList: [],
          availableStocks: {}, //used to lookup peerList names.
          targetStock: '',
        };

      this.baseState = {mounted: true}
      this.renderSearchPane = this.renderSearchPane.bind(this);
      this.renderStockData = this.renderStockData.bind(this);
      this.getStockData = this.getStockData.bind(this);
      this.updateFilter = this.updateFilter.bind(this);
      this.getSymbolList = this.getSymbolList.bind(this);
      this.getStockName = this.getStockName.bind(this);
      this.changeStockSelection = this.changeStockSelection.bind(this);
    }

    componentDidMount(){
      const p = this.props
      if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
        this.setState({...p.widgetCopy})
      } else {
        p.trackedStocks.sKeys()[0] !== undefined && this.setState({targetStock: p.trackedStocks.sKeys()[0]}, () => this.getStockData()) 
        this.getSymbolList()
      }
    }

    componentDidUpdate(prevProps, prevState){
      const p = this.props
      if (prevProps.trackedStocks.sKeys()[0] !== p.trackedStocks.sKeys()[0]) {
        this.setState({targetStock: p.trackedStocks.sKeys()[0]}, () => this.getStockData())
      }
    }

    componentWillUnmount(){
      this.baseState.mounted = false
    }

    changeStockSelection(e) {
      const target = e.target.value;
      console.log(target)
      this.setState({ targetStock: target }, () => this.getStockData());
    }

    updateFilter(e) {
      //e should be click event.
      this.props.updateWidgetFilters(this.props.widgetKey, "filterName", e)
    }

    getSymbolList() {
      const that = this
      const p = this.props
      // console.log("Getting symbol names for :", this.state.targetStock )
      const apiString = `https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${that.props.apiKey}`
        finnHub(this.props.throttle, apiString)  
        .then((data) => {
          if (this.baseState.mounted === true) {
            if (data.error === 429) { //run again
              this.getSymbolList()
            } else if (data.error === 401) {
              console.log("problem with API key, reseting api queue.")
              p.throttle.resetQueue()
              p.updateAPIFlag(2)
            } else {
              let updateStockList = Object.assign({}, data)
              for (const key in updateStockList) {
                let addStockData = updateStockList[key]
                let addStockKey = updateStockList[key]['symbol']
                updateStockList[addStockKey] = addStockData
                delete updateStockList[key]
              }
              that.setState({ availableStocks: Object.assign({}, updateStockList)});
            }
          }
        })
        .catch((error) => {
          console.error("Error retrieving stock symbol names!");
        });
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
    const stockList = p.trackedStocks.sKeys();
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
      const stockDataRows = s.peersList.map((el) => 
        <tr key={el + "row"}>
          <td key={el + "symbol"}>{el}</td>
          <td key={el + "name"}>{this.getStockName(el)}</td>
        </tr>
      )
      const newSymbolList = this.props.trackedStocks.sKeys().map((el) => (
        <option key={el + "ddl"} value={el}>
          {p.trackedStocks[el].dStock(p.exchangeList)}
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
      const queryString = `https://finnhub.io/api/v1/stock/peers?symbol=${stockSymbol}&token=${p.apiKey}`
      // console.log(queryString)
      finnHub(p.throttle, queryString)
      .then((data) => {
        if (that.baseState.mounted === true) {
          if (data.error === 429) { //run again
            this.getStockData()
          } else if (data.error === 401) {
            console.log("problem with API key, reseting api queue.")
            p.throttle.resetQueue()
            p.updateAPIFlag(2)
          } else {
            // console.log(data)
            this.setState({peersList: data})
          }
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


export function peersProps(that, key = "newWidgetNameProps") {
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


  // fetch('https://finnhub.io/api/v1/stock/profile2?symbol=AAPL&token=bsuu7qv48v6qu589jlj0')
  //   .then(response => response.json())
  //   .then(data => console.log(data))