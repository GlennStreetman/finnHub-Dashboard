import React, { Component } from 'react'
import StockSearchPane, {searchPaneProps} from "../../../components/stockSearchPane.js";
import {finnHub} from "../../../appFunctions/throttleQueue.js";

export default class widgetName extends Component {
    constructor(props) {
        super(props);
        this.state = {
          targetStock: '', //default stock, assuming only one stocks data shown at a time.
          stockData: undefined, //object returned by finnhub.
        };

      this.baseState = {mounted: true}
      this.renderSearchPane = this.renderSearchPane.bind(this);
      this.renderStockData = this.renderStockData.bind(this);
      this.getStockData = this.getStockData.bind(this);
      this.updateFilter = this.updateFilter.bind(this);
    }

    componentDidMount(){
      const p = this.props
      if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) { //loads saved data on component drag.
        this.setState({...p.widgetCopy})
      } else {
        p.trackedStocks.sKeys()[0] !== undefined && this.setState({targetStock: p.trackedStocks.sKeys()[0]}, ()=>this.getStockData()) 
      }
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
        //add widget data render here
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
          if (data.error === 429) { //run again
            this.getStockData(stock)
          } else if (data.error === 401) {
            console.log("problem with API access.")
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
      defaultExchange: that.props.defaultExchange,
      exchangeList: that.props.exchangeList,
      filters: that.props.widgetList[key]["filters"],
      showPane: that.showPane,
      trackedStocks: that.props.widgetList[key]["trackedStocks"],
      throttle: that.props.throttle,
      updateDefaultExchange: that.props.updateDefaultExchange,
      updateWidgetFilters: that.props.updateWidgetFilters,
      updateGlobalStockList: that.props.updateGlobalStockList,
      updateWidgetStockList: that.props.updateWidgetStockList,
      widgetKey: key,
    };
    return propList;
  }


  // fetch('https://finnhub.io/api/v1/search?q=WMT3.BA&token=bsuu7qv48v6qu589jlj0')
  //   .then(response => response.json())
  //   .then(data => console.log(data))

  // fetch('https://finnhub.io/api/v1/stock/split?symbol=TSLA&from=2001-02-23&to=2021-01-29&token=bsuu7qv48v6qu589jlj0')
  // .then((response) => {
  //   console.log(response) 
  //   return (response.json())})
  // .then(data => console.log(data))