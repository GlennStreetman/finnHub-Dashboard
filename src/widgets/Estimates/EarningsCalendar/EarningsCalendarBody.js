import React, { Component } from 'react'
import StockSearchPane, {searchPaneProps} from "../../../components/stockSearchPane.js";
import {finnHub} from "../../../appFunctions/throttleQueue.js";

export default class EstimatesEarningsCalendar extends Component {
    constructor(props) {
        super(props);
        this.state = {
          stockData: undefined, //object
          display: 'EPS', //EPS or Revenue
          targetStock: undefined //string
        };

      this.baseState = {mounted: true}
      this.renderSearchPane = this.renderSearchPane.bind(this);
      this.renderStockData = this.renderStockData.bind(this);
      this.getStockData = this.getStockData.bind(this);
      this.updateFilter = this.updateFilter.bind(this);
      this.findDate = this.findDate.bind(this);
      this.stockTable = this.stockTable.bind(this);
      this.changeValueSelection = this.changeValueSelection.bind(this);
      this.changeStockTarget = this.changeStockTarget.bind(this);
    }

    componentDidMount(){
      const p = this.props
      if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
        this.setState({...p.widgetCopy})
      } else {
        if (p.filters['startDate'] === undefined) {
          const startDateOffset = -604800*1000*52 //1 year backward. Limited to 1 year on free version.
          const endDateOffset = 0 //today.
          p.updateWidgetFilters(p.widgetKey, 'startDate', startDateOffset)
          p.updateWidgetFilters(p.widgetKey, 'endDate', endDateOffset)
          p.updateWidgetFilters(p.widgetKey, 'Description', 'Date numbers are millisecond offset from now. Used for Unix timestamp calculations.')
        } 

        if (p.trackedStocks.sKeys()[0] !== undefined) {
          this.setState({targetStock: p.trackedStocks.sKeys()[0]}, ()=>this.getStockData())
        }
      }
    }

    componentDidUpdate(prevProps, prevState){
      const p = this.props

      if (prevProps.trackedStocks.sKeys()[0] === undefined && p.trackedStocks.sKeys()[0] !== undefined) {
        this.setState({targetStock: p.trackedStocks.sKeys()[0]}, ()=> this.getStockData())
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
          <form className="form-stack">
            <label htmlFor="start">Start date:</label>
            <input className="btn" id="start" type="date" name="startDate" onChange={this.updateFilter} value={startDate}></input>
            <br />
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
      const actual = s.display === 'EPS' ? 'epsActual' : 'revenueActual'
      const estimate = s.display === 'EPS' ? 'epsEstimate' : 'revenueEstimate'
      let sortedData = s.stockData['earningsCalendar'] !== undefined ? s.stockData['earningsCalendar'].sort((a,b) => (new Date(a.date) > new Date(b.date) ? 1 : -1 )) : []
      let tableData = sortedData.map((el)=> {

        return <tr key={"row" + el.date}>
            <td className='rightTE' key={"period" + el.date}> {`${el['year']} Q:${el['quarter']}`} </td>
            {/* <td className='rightTE' key={"estimate" + el.date}>{Number(el[estimate]).toFixed(2)}</td>             */}
            <td className='rightTE' key={"estimate" + el.date}>{Number(el[estimate]).toLocaleString(
              undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2,})}
            </td>            
            <td className='rightTE' key={"actual" + el.date}>{Number(el[actual]).toLocaleString(
              undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2,})}
            </td> 
            <td className='rightTE' key={"var" + el.date}>{Number(el[actual] - el[estimate]).toLocaleString(
              undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2,})}
            </td> 
            <td className='rightTE' key={"var2" + el.date}>{Number(
              ((el[actual] - el[estimate]) / el[estimate])*100
              ).toLocaleString(
              undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2,})}
            </td> 
          </tr>
        
      })
      return tableData
    }

    changeValueSelection(e) {
      const target = e.target.value;
      this.setState({ display: target });

    }

    changeStockTarget(e) {
      const target = e.target.value;
      this.setState({ targetStock: target }, ()=>this.getStockData());
    }

    renderStockData() {
        const s = this.state
        const p = this.props
        let newSymbolList = ["EPS", "Revenue"].map((el) => (
          <option key={el} value={el}>
            {el}
          </option>
        ));
        // console.log(p.trackedStocks, p.trackedStocks.sKeys(), '<-----------------')
        let newStockList = p.trackedStocks.sKeys().map((el) => (
          <option key={el + "ddl"} value={el}>
            {p.trackedStocks[el].dStock(p.exchangeList)}
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

                {"  Display:  "}
                <select className="btn" value={s.display} onChange={this.changeValueSelection}>
                  {newSymbolList}
                </select>

              </div>            
                <table>
                  <thead>
                    <tr>
                      <td>Quarter</td>
                      <td>{s.display === 'EPS' ? 'EPS Estimate' : 'Revenue Estimate'}</td>
                      <td>{s.display === 'EPS' ? 'EPS Actual' : 'Revenue Actual'}</td>
                      <td>Variance</td>
                      <td>Variance%</td>
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
      const targetStockSymbole = p.trackedStocks[s.targetStock].symbol
      if (pf.startDate !== undefined && this.findDate(pf.endDate) !== undefined && s.targetStock !== undefined) {
          const queryString = `https://finnhub.io/api/v1/calendar/earnings?from=${this.findDate(pf.startDate)}1&to=${this.findDate(pf.endDate)}1&symbol=${targetStockSymbole}&token=${p.apiKey}`
          finnHub(p.throttle, queryString)
          .then((data) => {
            if (that.baseState.mounted === true) {
              if (data.error === 429) { //run again
                this.getStockData()
              } else if (data.error === 401) {
                console.log("Problem with API key access.")
                // p.throttle.resetQueue()
                // p.updateAPIFlag(2)
              } else {
                // console.log("UPDATING",data, queryString)
                this.setState({stockData: data})
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


export function EarningsCalendarProps(that, key = "newWidgetNameProps") {
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

  // fetch('https://finnhub.io/api/v1/calendar/earnings?from=2020-01-01&to=2020-12-31&symbol=AAPL&token=bsuu7qv48v6qu589jlj0')
  //   .then(response => response.json())
  //   .then(data => console.log(data))