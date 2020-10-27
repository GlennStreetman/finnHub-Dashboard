import React from "react";
import StockSearchPane from "../../stockSearchPane.js";

//Widget body component. Shows stock detail info and recent news. Maybe a graph?
class MetricsWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        metricList: [],
        // metricSelection: [], //needs to be moved into widgetList data saved in app component.
        metricData: {},
        metricIncrementor: 1,
        orderView: 0,
        symbolView: 0,
    };

    this.updateWidgetList = this.updateWidgetList.bind(this);
    this.renderStockData = this.renderStockData.bind(this);
    this.getCompanyMetrics = this.getCompanyMetrics.bind(this);
    this.selectMetrics = this.selectMetrics.bind(this);
    this.changeIncrememnt = this.changeIncrememnt.bind(this);
    this.metricsTable = this.metricsTable.bind(this);
    this.clickCheckBox = this.clickCheckBox.bind(this);
    this.checkStatus = this.checkStatus.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.changeOrder = this.changeOrder.bind(this); 
    this.mapStockData = this.mapStockData.bind(this);
  }

  componentDidMount(){
    //dumby stock symbol user to return list of all metrics.
    let that = this
    let setup = function () {that.props.throttle.enqueue(function() {  
      fetch("https://finnhub.io/api/v1/stock/metric?symbol=AAPL&metric=all&token=" + that.props.apiKey)
        .then((response) => {
          if (response.status === 429) {
            that.props.throttle.setSuspend(4000)
            setup()
            throw new Error('finnhub 429')
          } else {
          console.log(Date().slice(20,25) + ' setup metrics')
          return response.json()
        }
        })
        .then((data) => {
          that.setState({metricList: Object.keys(data.metric)})
        })
        .catch(error => {
          console.log(error.message)
        });
      })
    }

    setup()
    //initial setup the first time widget is loaded.
    if (this.props.metricSelection === undefined) {
      let newList = []
      this.props.updateWidgetData(this.props.widgetKey, 'metricSelection', newList)
    }
    //load initial data
    this.props.trackedStocks.forEach(el => this.getCompanyMetrics(el))
  }

  getCompanyMetrics(symbol) {
    let that = this
    that.props.throttle.enqueue(function() {  
    fetch("https://finnhub.io/api/v1/stock/metric?symbol=" + symbol.slice(symbol.indexOf("-")+1, symbol.length) + "&metric=all&token=" + that.props.apiKey)
        .then((response) => {
          if (response.status === 429) {
            that.props.throttle.setSuspend(4000)
            that.getCompanyMetrics(symbol)
            throw new Error('finnhub 429')
          } else {
            console.log(Date().slice(20,25) +  ": get company metrics" + symbol)
            return response.json()
          }
        })
        .then((data) => {
          let updateData = Object.assign({}, that.state.metricData)
          updateData[symbol] = data.metric
          that.setState({metricData: updateData})
        })
        .catch(error => {
          console.log(error.message)
        });
      })
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
    let moveFrom = this.props.metricSelection[indexRef]
    let moveTo = this.props.metricSelection[indexRef + change]
    let orderMetricSelection = this.props.metricSelection.slice()
    orderMetricSelection[indexRef] = moveTo
    orderMetricSelection[indexRef + change] = moveFrom
    this.props.updateWidgetData(this.props.widgetKey, 'metricSelection', orderMetricSelection)
    // this.setState({metricSelection: orderMetricSelection})
  }

  changeIncrememnt(e) {
    const newIncrement = this.state.metricIncrementor + e;
    if (newIncrement > 0 && newIncrement < this.state.metricList.length + 10) this.setState({ metricIncrementor: newIncrement });
  }

  selectMetrics(metric){

    if (this.props.metricSelection.indexOf(metric) < 0) {
      let newSelection = this.props.metricSelection.slice()
      newSelection.push(metric)
      this.props.updateWidgetData(this.props.widgetKey, 'metricSelection', newSelection)
      // this.setState({metricSelection: newSelection})
    } else {
      let newSelection = this.props.metricSelection.slice()
      newSelection.splice(newSelection.indexOf(metric), 1)
      this.props.updateWidgetData(this.props.widgetKey, 'metricSelection', newSelection)  
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

  clickCheckBox(boxValue){
    let newSelection = this.props.metricSelection.splice()
    newSelection.push(boxValue)
    this.props.updateWidgetData(this.props.widgetKey, 'metricSelection', newSelection)
    // this.setState({metricSelection: newSelection})
  }

  checkStatus(check){
    //sets status of check boxes when selecting or deselecting checkboxes.
    if (this.props.metricSelection.indexOf(check) > -1) {
      return true
    } else {return false}
  }

  metricsTable() {
    let increment = 10 * this.state.metricIncrementor; 
    let start = increment - 10;
    let end = increment;
    let metricSlice = this.state.metricList.slice(start, end);
    let selectionSlice = this.props.metricSelection.slice(start, end);
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
        <td key={el + "up"}>
          <button onClick={() => {this.updateWidgetList(el);}}><i className="fa fa-times" aria-hidden="true" /></button>
        </td>

      </tr>
    ));

    let metricSelectTable = (
      <div className="widgetTableDiv">
        <table className='widgetBodyTable'>
          <thead>
            <tr>
              <td>Metric</td>
              <td>{this.state.orderView === 0 ? 'Select' : 'Up'}</td>
              {this.state.orderView === 1 && (<td>Down</td>) }
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
    let findMetrics = this.props.metricSelection
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
    if (this.props.metricSelection !== undefined) {selectionList = this.props.metricSelection.slice()}
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
            getStockPrice={this.props.getStockPrice}
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

export function metricsProps(that, key = "MetricsWidget") {
  let propList = {
    apiKey: that.props.apiKey,
    getStockPrice: that.getStockPrice,
    showPane: that.showPane,
    trackedStocks: that.props.widgetList[key]["trackedStocks"],
    metricSelection: that.props.widgetList[key]["metricSelection"],
    updateWidgetData: that.props.updateWidgetData,
    updateGlobalStockList: that.props.updateGlobalStockList,
    updateWidgetStockList: that.props.updateWidgetStockList,
    widgetKey: key,
    throttle: that.props.throttle,
    globalStockObject: that.props.globalStockObject,
  };
  return propList;
}

export default MetricsWidget;
