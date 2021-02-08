import React, { Component } from 'react'
import {finnHub} from "../../../appFunctions/throttleQueue.js";


export default class FundamentalsIPOCalendar extends Component {
    constructor(props) {
        super(props);
        this.state = {
          IPOData: undefined, //object
          paginationInt: 0,
        };

      this.baseState = {mounted: true}
      this.renderSearchPane = this.renderSearchPane.bind(this);
      this.renderStockData = this.renderStockData.bind(this);
      this.getStockData = this.getStockData.bind(this);
      this.updateFilter = this.updateFilter.bind(this);
      this.findDate = this.findDate.bind(this);
      this.stockTable = this.stockTable.bind(this);
      this.changeIncrement = this.changeIncrement.bind(this);
    }

    componentDidMount(){
      const p = this.props
      if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
        this.setState({...p.widgetCopy})
      } else {
        if (p.filters['startDate'] === undefined) {
          const startDateOffset = -604800*1000*52 //1 year backward.
          const endDateOffset = 604800*1000*52 //1 year forward.
          p.updateWidgetFilters(p.widgetKey, 'startDate', startDateOffset)
          p.updateWidgetFilters(p.widgetKey, 'endDate', endDateOffset)
          p.updateWidgetFilters(p.widgetKey, 'Description', 'Date numbers are millisecond offset from now. Used for Unix timestamp calculations.')
        } 
        this.getStockData()
      }
    }

    componentDidUpdate(prevProps, prevState){
      //pass
    }

    componentWillUnmount(){
      this.baseState.mounted = false
    }

    updateFilter(e) {
      if (isNaN(new Date(e.target.value).getTime()) === false){
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
      const pf = this.props.filters
        return <>
          <div className="stockSearch">
            <form className="form-stack">
              <label htmlFor="start">Start date:</label>
              <input className="btn" id="start" type="date" name="startDate" onChange={this.updateFilter} value={this.findDate(pf.startDate)}></input>
              <br />
              <label htmlFor="end">End date:</label>
              <input className="btn" id="end" type="date" name="endDate" onChange={this.updateFilter} value={this.findDate(pf.endDate)}></input>
            </form>
          </div>
        </>
    }

    stockTable(data){
      let tableData = Object.keys(data).map((el)=>
        <tr key={"row" + el}>
          <td key={"heading" + el}>{el}</td>
          <td key={"value" + el}>{data[el]}</td>
        </tr>
      )
      return tableData
    }

    changeIncrement(e) {
      const s = this.state
      const newIncrement = this.state.paginationInt + e;
      if (newIncrement > -1 && newIncrement < s.IPOData.length) this.setState({ paginationInt: newIncrement });
    }

    renderStockData(){

        const s = this.state
        if (s.IPOData !== undefined) {
        let currentFiling = s.IPOData[s.paginationInt]
        let symbolSelectorDropDown = (
          <>
            <div>
              <button onClick={() => this.changeIncrement(-1)}>
                <i className="fa fa-backward" aria-hidden="true"></i>
              </button>
              <button onClick={() => this.changeIncrement(1)}>
                <i className="fa fa-forward" aria-hidden="true"></i>
              </button>
            </div>
            <div>
              {s.IPOData !== undefined && 
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
      const pf = this.props.filters
      const that = this
      if (pf.startDate !== undefined && this.findDate(pf.endDate) !== undefined) {
        const queryString = `https://finnhub.io/api/v1/calendar/ipo?from=${this.findDate(pf.startDate)}&to=${this.findDate(pf.endDate)}&token=${p.apiKey}`
        // console.log(queryString)
        finnHub(p.throttle, queryString)
        .then((data) => {
          if (that.baseState.mounted === true) {
            if (data.error === 429) { //run again
              this.getStockData()
            } else {
              this.setState({IPOData: data['ipoCalendar']})
            }
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


export function IPOCalendarProps(that, key = "newWidgetNameProps") {
    let propList = {
      apiKey: that.props.apiKey,
      // showPane: that.showPane,
      // trackedStocks: that.props.widgetList[key]["trackedStocks"],
      filters: that.props.widgetList[key]["filters"],
      updateWidgetFilters: that.props.updateWidgetFilters,
      // updateGlobalStockList: that.props.updateGlobalStockList,
      // updateWidgetStockList: that.props.updateWidgetStockList,
      widgetKey: key,
      throttle: that.props.throttle,
      // exchangeList: that.props.exchangeList,
      // defaultExchange: that.props.defaultExchange,
      // updateDefaultExchange: that.props.updateDefaultExchange,
    };
    return propList;
  }