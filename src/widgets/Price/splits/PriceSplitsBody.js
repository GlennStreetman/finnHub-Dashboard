import React, { Component } from 'react'
import StockSearchPane, {searchPaneProps} from "../../../components/stockSearchPane.js";
import {finnHub} from "../../../appFunctions/throttleQueue.js";
import {dStock} from "../../../appFunctions/formatStockSymbols.js";

export default class PriceSplits extends Component {
    constructor(props) {
        super(props);
        this.state = {
          stockData: undefined, //object
          targetStock: undefined //string
        };

      this.baseState = {mounted: true}
      this.renderSearchPane = this.renderSearchPane.bind(this);
      this.renderStockData = this.renderStockData.bind(this);
      this.getStockData = this.getStockData.bind(this);
      this.updateFilter = this.updateFilter.bind(this);
      this.findDate = this.findDate.bind(this);
      this.stockTable = this.stockTable.bind(this);
      // this.changeValueSelection = this.changeValueSelection.bind(this);
      this.changeStockTarget = this.changeStockTarget.bind(this);
    }

    componentDidMount(){
      const p = this.props
      if (p.filters['startDate'] === undefined) {
        const startDateOffset = -604800*1000*52*20 //20 year backward. Limited to 1 year on free version.
        const endDateOffset = 0 //today.
        p.updateWidgetFilters(p.widgetKey, 'startDate', startDateOffset)
        p.updateWidgetFilters(p.widgetKey, 'endDate', endDateOffset)
        p.updateWidgetFilters(p.widgetKey, 'Description', 'Date numbers are millisecond offset from now. Used for Unix timestamp calculations.')
      } 

      if (p.trackedStocks.sKeys()[0] !== undefined) {
        this.setState({targetStock: p.trackedStocks.sKeys()[0]}, ()=>this.getStockData())
      }
    }

    componentDidUpdate(prevProps, prevState){
      const p = this.props

      if (prevProps.trackedStocks.sKeys()[0] === undefined && p.trackedStocks.sKeys()[0] !== undefined) {
        this.setState({targetStock: p.trackedStocks.sKeys()[0]}, ()=>this.getStockData())
      }
    }

    componentWillUnmount(){
      this.baseState.mounted = false
    }

    updateFilter(e) {
      if (isNaN(new Date(e.target.value).getTime()) === false) {
        const now = Date.now()
        const target = new Date(e.target.value).getTime();
        const offset = target - now  
        const name = e.target.name;
  
        this.props.updateWidgetFilters(this.props.widgetKey, name, offset)
      }
    }

    findDate(offset){
      const returnDate = new Date(Date.now() + offset).toISOString().slice(0, 10) 
      return returnDate
    }

    renderSearchPane(){
      //add search pane rendering logic here. Additional filters need to be added below.
    const p = this.props
    const stockList = p.trackedStocks.sKeys();
    const stockListRows = stockList.map((el) =>
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
      )
      
    const now = Date.now()
    const startUnixOffset = p.filters.startDate !== undefined ? p.filters.startDate : -604800*1000*52
    const startUnix = now + startUnixOffset
    const endUnixOffset = p.filters.startDate !== undefined ? p.filters.endDate : 0
    const endUnix = now + endUnixOffset
    const startDate = new Date(startUnix).toISOString().slice(0, 10);
    const endDate = new Date(endUnix).toISOString().slice(0, 10);

    let searchForm = ( 
      <>
        <div className="stockSearch">
          <form className="form-inline">
            <label htmlFor="start">Start date:</label>
            <input className="btn" id="start" type="date" name="startDate" onChange={this.updateFilter} value={startDate}></input>
            <label htmlFor="end">End date:</label>
            <input className="btn" id="end" type="date" name="endDate" onChange={this.updateFilter} value={endDate}></input>
          </form>
        </div>
        <table>
          <tbody>{stockListRows}</tbody>
        </table>
      </>
    );
    return searchForm
    }

    stockTable(){
      const s = this.state
      let sortedData = s.stockData.sort((a,b) => (new Date(a.date) > new Date(b.date) ? 1 : -1 ))
      let tableData = sortedData.map((el)=> {

        return <tr key={"row" + el.date}>
            <td>{el.date}</td>
            <td>{el.fromFactor}</td>
            <td>{el.toFactor}</td>
          </tr>
        
      })
      return tableData
    }

    changeStockTarget(e) {
      const target = e.target.value;
      this.setState({ targetStock: target }, ()=>this.getStockData());
    }

    renderStockData() {
        const s = this.state

        let newStockList = this.props.trackedStocks.sKeys().map((el) => (
          <option key={el + "ddl"} value={el}>
            {dStock(el, this.props.exchangeList)}
          </option>
        ));

        if (s.stockData !== undefined) {
          let symbolSelectorDropDown = (
            <>
              <div className="div-inline">
                {"  Stock:  "}
                <select className="btn" value={s.targetStock} onChange={this.changeStockTarget}>
                  {newStockList}
                </select>
              </div>            
                <table>
                  <thead>
                    <tr>
                      <td>Date</td>
                      <td>From:</td>
                      <td>To:</td>
                    </tr>
                  </thead>
                  <tbody>{this.stockTable()}</tbody>
                </table>
            </>
          );
        return symbolSelectorDropDown;
      }
    } 

    getStockData(){
      const p = this.props
      const s = this.state
      const pf = this.props.filters
      const that = this
      if (pf.startDate !== undefined && this.findDate(pf.endDate) !== undefined && s.targetStock !== undefined) {
          const queryString = `https://finnhub.io/api/v1/stock/split?symbol=${dStock(s.targetStock,p.exchangeList)}&from=${this.findDate(pf.startDate)}&to=${this.findDate(pf.endDate)}&token=${p.apiKey}`
          finnHub(p.throttle, queryString)
          .then((data) => {
            if (that.baseState.mounted === true) {
              console.log(data, queryString)
              this.setState({stockData: data})
            }
          })
          .catch(error => {
            console.log(error.message)
          });
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
            {this.props.showEditPane === 0 && (
            <>
            {this.renderStockData()}
            </>
            )}      
          </>
        )
    }
  }


export function PriceSplitsProps(that, key = "newWidgetNameProps") {
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
