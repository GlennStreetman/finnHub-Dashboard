import React from "react";
import StockSearchPane from "../../../components/stockSearchPane.js";
import {finnHub} from "../../../appFunctions/throttleQueue.js";

//Widget body component. Shows stock detail info and recent news. Maybe a graph?
export default class FundamentalsBasicFinancials extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        targetStock: 'US-AAPL',
        metricList: [],
        metricData: {},
        metricIncrementor: 1,
        orderView: 0,
        symbolView: 0,
    };

    this.baseState = {mounted: true}
    this.updateWidgetList = this.updateWidgetList.bind(this);
    this.renderStockData = this.renderStockData.bind(this);
    this.getCompanyMetrics = this.getCompanyMetrics.bind(this);
    this.selectMetrics = this.selectMetrics.bind(this);
    this.changeIncrememnt = this.changeIncrememnt.bind(this);
    this.metricsTable = this.metricsTable.bind(this);
    this.checkStatus = this.checkStatus.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.changeOrder = this.changeOrder.bind(this); 
    this.mapStockData = this.mapStockData.bind(this);
  }

  componentDidMount(){
    const p = this.props
    //initial setup the first time widget is loaded.
    if (p.filters['metricSelection'] === undefined) {
      let newList = []
      p.updateWidgetFilters(p.widgetKey, 'metricSelection', newList)
      p.trackedStocks[0] === undefined ?
        p.updateWidgetFilters(p.widgetKey, 'metricSource', 'US-AAPL') :
        p.updateWidgetFilters(p.widgetKey, 'metricSource', p.trackedStocks[0])
        p.updateWidgetFilters(p.widgetKey, 'Note', 'Metric source for dashboard display purposes.')
    }

    if (this.props.apiKey !== '' ) {
      const that = this
      console.log( p.filters)
      const sourceStock = p.filters.metricSource
      const sourceSymbol = sourceStock.slice(sourceStock.indexOf('-') + 1, sourceStock.length)
      let queryString = `https://finnhub.io/api/v1/stock/metric?symbol=${sourceSymbol}&metric=all&token=${p.apiKey}`
      console.log(queryString)
      finnHub(p.throttle, queryString)
      .then((data) => {
        if (this.baseState.mounted === true) {
          that.setState({metricList: Object.keys(data.metric)})
        }
      })
      .catch(error => {
        console.log(error.message)
      });

      // load initial data
      p.trackedStocks.forEach(el => this.getCompanyMetrics(el))
    }
  }

  componentWillUnmount(){
    this.baseState.mounted = false
  }

  getCompanyMetrics(symbol) {
    if (this.props.apiKey !== '') {
      let that = this
      let querySting = "https://finnhub.io/api/v1/stock/metric?symbol=" + 
        symbol.slice(symbol.indexOf("-")+1, symbol.length) + 
        "&metric=all&token=" + 
        that.props.apiKey
      finnHub(this.props.throttle, querySting)
      .then((data) => {
          if (this.baseState.mounted === true) {
            let updateData = Object.assign({}, that.state.metricData)
            updateData[symbol] = data.metric
            that.setState({metricData: updateData})
          }
        })
        .catch(error => {
          console.log(error.message)
        });
    }
  }
  
  componentDidUpdate(prevProps, PrevState) {
    // if (this.props.trackedStocks === 0 && prevProps.showEditPane === 1) {
    //   this.props.trackedStocks.forEach(el => this.getCompanyMetrics(el))
    // }
    if (this.props.trackedStocks !== prevProps.trackedStocks) {
      this.props.trackedStocks.forEach(el => {
        prevProps.trackedStocks.indexOf(el) === -1 && this.getCompanyMetrics(el)
      })
    }
  }

  handleChange(stateRef) {
    this.state[stateRef] === 1 ? this.setState({ [stateRef]: 0 }) : this.setState({ [stateRef]: 1 });
    this.setState({metricIncrementor: 1})
  }

  changeOrder(indexRef, change){
    // console.log(indexRef + ":" + change)
    let moveFrom = this.props.filters.metricSelection[indexRef]
    let moveTo = this.props.filters.metricSelection[indexRef + change]
    let orderMetricSelection = this.props.filters.metricSelection.slice()
    orderMetricSelection[indexRef] = moveTo
    orderMetricSelection[indexRef + change] = moveFrom
    this.props.updateWidgetFilters(this.props.widgetKey, 'metricSelection', orderMetricSelection)
    // this.setState({metricSelection: orderMetricSelection})
  }

  changeIncrememnt(e) {
    const newIncrement = this.state.metricIncrementor + e;
    if (newIncrement > 0 && newIncrement < this.state.metricList.length + 10) this.setState({ metricIncrementor: newIncrement });
  }

  selectMetrics(metric){

    if (this.props.filters.metricSelection.indexOf(metric) < 0) {
      let newSelection = this.props.filters.metricSelection.slice()
      newSelection.push(metric)
      this.props.updateWidgetFilters(this.props.widgetKey, 'metricSelection', newSelection)
      // this.setState({metricSelection: newSelection})
    } else {
      let newSelection = this.props.filters.metricSelection.slice()
      newSelection.splice(newSelection.indexOf(metric), 1)
      this.props.updateWidgetFilters(this.props.widgetKey, 'metricSelection', newSelection)  
      // this.setState({metricSelection: newSelection})
    }
  }

  getMetrics(){

    let metricSelector = (
      <>
        <div>
          <button onClick={() => this.changeIncrememnt(-1)}>
            <i className="fa fa-backward" aria-hidden="true"></i>
          </button>
          <button onClick={() => this.changeIncrememnt(1)}>
            <i className="fa fa-forward" aria-hidden="true"></i>
          </button>
          {this.state.symbolView === 0 &&(
            <button onClick={() => this.handleChange('orderView')}>
              {this.state.orderView === 0 ? 'Order' : 'Selection'}
            </button>
          )}
          <button onClick={() => this.handleChange('symbolView')}>
            {this.state.symbolView === 0 ? 'Stocks' : 'Metrics'}
          </button>
        </div>
        <div>{this.metricsTable()}</div>
      </> )
    return metricSelector
  }

  checkStatus(check){
    //sets status of check boxes when selecting or deselecting checkboxes.
    if (this.props.filters !== undefined && this.props.filters.metricSelection.indexOf(check) > -1) {
      return true
    } else {return false}
  }

  metricsTable() {
    const p = this.props
    let increment = 10 * this.state.metricIncrementor; 
    let start = increment - 10;
    let end = increment;
    let metricSlice = this.state.metricList.slice(start, end);
    let selectionSlice = this.props.filters.metricSelection.slice(start, end);
    let stockSelectionSlice = this.props.trackedStocks.slice(start, end);
    // console.log(selectionSlice)
    let mapMetrics = metricSlice.map((el, index) => (
      <tr key={el + "metricRow" + index}>
        <td key={el + "metricdesc"}>{el}</td>
        <td key={el + "metricSelect"}>
        <input type="checkbox" key={el + "checkbox"} onChange={() => this.selectMetrics(el)} checked={this.checkStatus(el)} /> 
        </td>
      </tr>
    ));

    let mapMetricSelection = selectionSlice.map((el, index) => (
      <tr key={el + "metricRow" + index}>
        <td key={el + "metricdesc"}>{el}</td>
        <td key={el + "up"}>
          <button onClick={() => this.changeOrder(index, -1)}><i className="fa fa-sort-asc" aria-hidden="true"></i></button>
        </td>
        <td key={el + "down"}>
          <button onClick={() => this.changeOrder(index, 1)}><i className="fa fa-sort-desc" aria-hidden="true"></i></button>
        </td>
      </tr>
    ));

    let mapStockSelection = stockSelectionSlice.map((el, index) => (
      <tr key={el + "metricRow" + index}>
        <td key={el + "metricdesc"}>{el}</td>
        <td><input type='radio' name='sourceStock' checked={p.filters.metricSource === el} onClick={()=> p.updateWidgetFilters(p.widgetKey, 'metricSource', el)} /></td>
        <td key={el + "remove"}>
          <button onClick={() => {this.updateWidgetList(el);}}><i className="fa fa-times" aria-hidden="true" /></button>
        </td>

      </tr>
    ));

    let metricSelectTableheading = () => {
      if (this.state.symbolView === 1) {
        return (
          <>
          <td>Stock</td>
          <td>Source</td>
          <td>Remove</td>
          </>
        )
      } else if (this.state.orderView === 0){
        return (
          <>
          <td>Metric</td>
          <td>Select</td>
          </>
        )
      } else {
        return(
          <>
          <td>Metric</td>
          <td>Up</td>
          <td>Down</td>
          </>
        )
      }
    }


    

    let metricSelectTable = (
      <div className="widgetTableDiv">
        <table className='widgetBodyTable'>
          <thead>
            <tr>
            {metricSelectTableheading()}
            </tr>
          </thead>
          <tbody>
            {this.state.orderView === 0 && this.state.symbolView === 0 && mapMetrics}
            {this.state.orderView === 1 && this.state.symbolView === 0 && mapMetricSelection}
            {this.state.symbolView === 1 && mapStockSelection}
          </tbody>
        </table>
      </div>
    );
    return metricSelectTable;
  }

  updateWidgetList(stock) {
    // console.log("updating");
    if (stock.indexOf(":") > 0) {
      const stockSymbole = stock.slice(0, stock.indexOf(":"));
      this.props.updateWidgetStockList(this.props.widgetKey, stockSymbole);
    } else {
      this.props.updateWidgetStockList(this.props.widgetKey, stock);
    }
  }

  mapStockData(symbol){
    let symbolData = this.state.metricData[symbol]
    let findMetrics = this.props.filters.metricSelection
    // console.log(findMetrics)
    let returnMetrics = []
    for (var x in findMetrics) {
      try {
        // console.log(findMetrics[x])
        let metric = symbolData[findMetrics[x]]
        returnMetrics.push(metric.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }))
      } catch(err){
        // console.log('mapStockData err')
      }
    }
    // console.log(returnMetrics)
    let thisKey = this.props.widgetKey
    let thisMetricList = returnMetrics.map((el, ind) => <td className="rightTE" key={thisKey + el + ind + "dat"}>{el}</td>)
    return thisMetricList
  }

  renderStockData() {
    let selectionList = []
    let thisKey = this.props.widgetKey
    if (this.props.filters.metricSelection !== undefined) {selectionList = this.props.filters.metricSelection.slice()}
    let headerRows = selectionList.map((el) => {
      let title = el.replace(/([A-Z])/g, ' $1').trim().split(" ").join("\n")
      if (title.search(/\d\s[A-Z]/g) !== -1) {
        title = title.slice(0, title.search(/\d\s[A-Z]/g)+1) + '-' + title.slice(title.search(/\d\s[A-Z]/g)+2)
      }
      // console.log(title)
      title = title.replace(/T\sT\sM/g, 'TTM')
      // console.log(title)
      return (<td className='tdHead' key={thisKey + el +  "title"}>{title}</td>)}
      )
    let bodyRows = this.props.trackedStocks.map((el) => { return (
    <tr key={thisKey + el + "tr1"}>
    <td key={thisKey + el + "td1"}>{el}</td>
    {this.mapStockData(el)}
    </tr>
    )})
    let buildTable = <div className="widgetTableDiv">
      <table className='widgetBodyTable'>
        <thead>
          <tr>
            <td className='centerBottomTE'>Symbol</td>
            {headerRows}
          </tr>
        </thead>
        <tbody>
          {bodyRows}
        </tbody>
      </table>
    </div>

    return buildTable;
  }

  render() {
    return (
      <>
        {this.props.showEditPane === 1 && (
          <>
          <StockSearchPane
            updateGlobalStockList={this.props.updateGlobalStockList}
            showSearchPane={() => this.props.showPane("showEditPane", 1)}
            apiKey={this.props.apiKey}
            updateWidgetStockList={this.props.updateWidgetStockList}
            widgetKey={this.props.widgetKey}
            throttle={this.props.throttle}
          />
          {this.getMetrics()}
          </>
        )}
        {Object.keys(this.props.trackedStocks).length > 0 && this.props.showEditPane === 0  ? this.renderStockData() : <></>}       
      </>
    );
  }
}

export function metricsProps(that, key = "basicFinancials") {
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
  };
  return propList;
}

