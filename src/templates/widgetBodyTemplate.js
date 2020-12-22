import React, { Component } from 'react'
import StockSearchPane, {searchPaneProps} from "../../../components/stockSearchPane.js";
import {finnHub} from "../../../appFunctions/throttleQueue.js";
import {dStock} from "../../../appFunctions/formatStockSymbols.js";

export default class widgetName extends Component {
    constructor(props) {
        super(props);
        this.state = {
          
        };

      this.baseState = {mounted: true}
      this.renderSearchPane = this.renderSearchPane.bind(this);
      this.renderStockData = this.renderStockData.bind(this);
      this.getStockData = this.getStockData.bind(this);
      this.updateFilter = this.updateFilter.bind(this);
    }

    componentDidMount(){
      const p = this.props
      p.stockList[0] !== undefined && this.setState({targetStock: p.stockList[0]}) 

    }

    componentDidUpdate(prevProps, prevState){
      //pass
    }

    componentWillUnmount(){
      this.baseState.mounted = false
    }

    updateFilter(e) {
      //e should be click event.
      this.props.updateWidgetFilters(this.props.widgetKey, "filterName", e)
  }

    renderSearchPane(){
        //add search pane rendering logic here. Additional filters need to be added below.
    }

    renderStockData(){
        //add widget data here
    } 

    getStockData(stock){
      const p = this.props
      const that = this
      const queryString = `------------apiEndPointQueryString--------------`
      finnHub(p.throttle, queryString)
      .then((data) => {
        if (that.baseState.mounted === true) {
          //update state
          console.log(data)
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


export function newWidgetNameProps(that, key = "newWidgetNameProps") {
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