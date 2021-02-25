import React from "react";
import StockSearchPane, {searchPaneProps} from "../../../components/stockSearchPane.js";
import {finnHub} from "../../../appFunctions/throttleQueue.js";

export default class PriceQuote extends React.Component {
  //widget data provided by appFunctions/getSTockPrices
  //Data is shared with widgets/Menu/watchListMenu
  constructor(props) {
    super(props);
    this.state = {
      stockData: {}
    };

    this.baseState = {mounted: true}
    this.getStockData = this.getStockData.bind(this);
    this.renderStockData = this.renderStockData.bind(this);
    this.findPrice = this.findPrice.bind(this)
    this.returnKey = this.returnKey.bind(this)
  }

  componentDidMount(){
    const p = this.props
    if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
      this.setState({...p.widgetCopy})
    } else {
      const stocks = p.trackedStocks.sKeys && p.trackedStocks.sKeys()
      for (const x in stocks) {
        this.getStockData(p.trackedStocks[stocks[x]]['symbol'], p.trackedStocks[stocks[x]]['key'])
      }
    }
  }

  componentDidUpdate(prevProps){
    const p = this.props

    if (p.trackedStocks !== prevProps.trackedStocks){
      const oList = prevProps.trackedStocks.sKeys()
      const nList = p.trackedStocks.sKeys()
      const sList = [...new Set([...oList, ...nList])]
      for (const s in sList) {
        prevProps.trackedStocks[sList[s]] === undefined && this.getStockData(p.trackedStocks[sList[s]].symbol, sList[s])
      }
    }
  }

  componentWillUnmount(){
    this.baseState.mounted = false
  }

  returnKey(ref){
    const retVal = ref !== undefined ? ref["currentPrice"] : "noDat"
    return retVal
  }

  getStockData(stock, key){
    const p = this.props
    // const that = this
    const queryString = `https://finnhub.io/api/v1/quote?symbol=${stock}&token=${p.apiKey}`
    // console.log(queryString)
    finnHub(p.throttle, queryString)
    .then((data) => {
      const s = this.state
      if (this.baseState.mounted === true) {
        if (data.error === 429) { //run again
          this.getStockData(stock)
        } else if (data.error === 401) {
          console.log("Problem with API key access.")
          // p.throttle.resetQueue()
          // p.updateAPIFlag(2)
        } else {
          const newData = {...s.stockData}
          newData[key] = {}
          newData[key]['currentPrice'] = data.c
          newData[key]['dayHighPrice'] = data.h
          newData[key]['dayLowPrice'] = data.l
          newData[key]['dayOpenPrice'] = data.o
          newData[key]['prevClosePrice'] = data.pc
          this.setState({stockData: newData})
        }
      }
    })
    .catch(error => {
      console.log(error.message)
    });
  }

  findPrice(stock){
    const p = this.props
    const s = this.state
    if (p.streamingPriceData[stock] !== undefined) {
      const sPrice = p.streamingPriceData[stock].currentPrice
      const dayPrice = s.stockData[stock] ? s.stockData[stock].currentPrice : 0
      const price = isNaN(sPrice) === false ? sPrice : dayPrice
      return price  
    } else {
      const dayPrice = s.stockData[stock] ? s.stockData[stock].currentPrice : 0
      return dayPrice
    }
  }

  renderStockData() {
    const p = this.props
    const s = this.state
    let pd = s.stockData;
    let widgetStockList = p.trackedStocks.sKeys();

    let stockDetailRow = widgetStockList.map((el) =>
        pd[el] ? (
        <tr key={el + "st" + + pd[el]["currentPrice"]}>
          <td key={el + "id"}>{p.trackedStocks[el].dStock(p.exchangeList)}</td>
          <td className="rightTE" key={el + "prevClosePrice"}>
            {pd[el]["prevClosePrice"].toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </td>
          <td className="rightTE" key={el + "dayOpenPrice"}>
            {pd[el]["dayOpenPrice"].toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </td>
          <td className="rightTE" key={el + "dayLowPrice"}>
            {pd[el]["dayLowPrice"].toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </td>
          <td className="rightTE" key={el + "dayHighPrice"}>
            {pd[el]["dayHighPrice"].toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </td>
          
          <td className='rightTEFade' key={el + "currentPrice" + this.returnKey(p.streamingPriceData[el])}>
            
            {/* {pd[el]["currentPrice"].toLocaleString(undefined, { */}
            {this.findPrice(el).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </td>

          {this.props.showEditPane === 1 ? (
            <td className="rightTE" key={el + "buttonBox"}>
              <button
                key={el + "button"}
                onClick={() => {
                  this.props.updateWidgetList(this.props.widgetKey, el);
                }}
              >
                <i className="fa fa-times" aria-hidden="true"></i>
              </button>
            </td>
          ) : (
            <></>
          )}
        </tr>
      ) : (
        <tr key={el + ""}></tr>
      )
    );
    let buildTable = (
      <table className="widgetBodyTable" key={this.props.widgetKey + "id"}>
        <thead key={this.props.widgetKey + "head"}>
          <tr key={this.props.widgetKey + "tr"}>
            <td key={this.props.widgetKey + "stock"}>Symbole:</td>
            <td className="centerTE" key={this.props.widgetKey + "close"}>
              Prev Close
            </td>
            <td className="centerTE" key={this.props.widgetKey + "open"}>
              Day Open
            </td>
            <td className="centerTE" key={this.props.widgetKey + "low"}>
              Day Low
            </td>
            <td className="centerTE" key={this.props.widgetKey + "high"}>
              Day High
            </td>
            <td className="centerTE" key={this.props.widgetKey + "price"}>
              Price
            </td>

            {this.props.showEditPane === 1 ? <td key={this.props.widgetKey + "remove"}>Remove</td> : <></>}
          </tr>
        </thead>
        <tbody key={this.props.widgetKey + "body"}>{stockDetailRow}</tbody>
      </table>
    );

    return buildTable;
  }

  render() {
    return (
      <>
        {this.props.showEditPane === 1 && (
          React.createElement(StockSearchPane, searchPaneProps(this))

        )}
        {Object.keys(this.props.streamingPriceData).length > 0 ? this.renderStockData() : <></>}
      </>
    );
  }
}

export function quoteBodyProps(that, key = "Quote") {
  let propList = {
    apiKey: that.props.apiKey,
    showPane: that.showPane,
    trackedStocks: that.props.widgetList[key]["trackedStocks"],
    streamingPriceData: that.props.streamingPriceData,
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

