import React from "react";
import StockSearchPane from "../../stockSearchPane.js";

//Widget body component. Shows stock detail info and recent news. Maybe a graph?
class MetricsWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        metricList: [],
        metricSelection: [],
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
    //dumby stock symbol user to return list of all metrics
    fetch("https://finnhub.io/api/v1/stock/metric?symbol=AAPL&metric=all&token=" + this.props.apiKey)
    .then((response) => response.json())
    .then((data) => {
      this.setState({metricList: Object.keys(data.metric)})
    })
  }

  getCompanyMetrics(symbol) {
    fetch("https://finnhub.io/api/v1/stock/metric?symbol=" + symbol + "&metric=all&token=" + this.props.apiKey)
      .then((response) => response.json())
      .then((data) => {
        let updateData = Object.assign({}, this.state.metricData)
        updateData[symbol] = data.metric
        this.setState({metricData: updateData})
      });
  }

  componentDidUpdate(prevProps, PrevState) {
    if (this.props.showEditPane === 0 && prevProps.showEditPane === 1) {
      this.props.trackedStocks.forEach(el => this.getCompanyMetrics(el))
    }
  }

  handleChange(stateRef) {
    this.state[stateRef] === 1 ? this.setState({ [stateRef]: 0 }) : this.setState({ [stateRef]: 1 });
    this.setState({metricIncrementor: 1})
  }

  changeOrder(indexRef, change){
    console.log(indexRef + ":" + change)
    let moveFrom = this.state.metricSelection[indexRef]
    let moveTo = this.state.metricSelection[indexRef + change]
    let orderMetricSelection = this.state.metricSelection.slice()
    orderMetricSelection[indexRef] = moveTo
    orderMetricSelection[indexRef + change] = moveFrom
    this.setState({metricSelection: orderMetricSelection})
  }

  changeIncrememnt(e) {
    const newIncrement = this.state.metricIncrementor + e;
    if (newIncrement > 0 && newIncrement < this.state.metricList.length + 10) this.setState({ metricIncrementor: newIncrement });
  }

  selectMetrics(metric){

    if (this.state.metricSelection.indexOf(metric) < 0) {
      let newSelection = this.state.metricSelection.slice()
      newSelection.push(metric)
      this.setState({metricSelection: newSelection})
    } else {
      let newSelection = this.state.metricSelection.slice()
      newSelection.splice(newSelection.indexOf(metric), 1)
      this.setState({metricSelection: newSelection})
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
    let newSelection = this.state.metricSelection.splice()
    newSelection.push(boxValue)
    this.setState({metricSelection: newSelection})
  }

  checkStatus(check){
    if (this.state.metricSelection.indexOf(check) > -1) {
      return true
    } else {return false}
  }

  metricsTable() {
    let increment = 10 * this.state.metricIncrementor; 
    let start = increment - 10;
    let end = increment;
    let metricSlice = this.state.metricList.slice(start, end);
    let selectionSlice = this.state.metricSelection.slice(start, end);
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
    console.log("updating");
    if (stock.indexOf(":") > 0) {
      const stockSymbole = stock.slice(0, stock.indexOf(":"));
      this.props.updateWidgetStockList(this.props.widgetKey, stockSymbole);
    } else {
      this.props.updateWidgetStockList(this.props.widgetKey, stock);
    }
  }

  mapStockData(symbol){
    let symbolData = this.state.metricData[symbol]
    let findMetrics = this.state.metricSelection
    // console.log(findMetrics)
    let returnMetrics = []
    for (var x in findMetrics) {
      try {
        // console.log(findMetrics[x])
        let metric = symbolData[findMetrics[x]]
        returnMetrics.push(metric)
      } catch(err){
        console.log('mapStockData err')
      }
    }
    // console.log(returnMetrics)
    let thisMetricList = returnMetrics.map((el) => <td>{el}</td>)
    return thisMetricList
  }

  renderStockData() {

    let headerRows = this.state.metricSelection.map((el) => {
      let title = el.replace(/([A-Z])/g, ' $1').trim().split(" ").join("\n")
      if (title.search(/\d\s[A-Z]/g) !== -1) {
        title = title.slice(0, title.search(/\d\s[A-Z]/g)+1) + '-' + title.slice(title.search(/\d\s[A-Z]/g)+2)
      }
      console.log(title)
      title = title.replace(/T\sT\sM/g, 'TTM')
      console.log(title)
      return (<td className='tdHead'>{title}</td>)}
      )
    let bodyRows = this.props.trackedStocks.map((el) => { return (
    <tr>
    <td>{el}</td>
    {this.mapStockData(el)}
    </tr>
    )})
    let buildTable = <div className="widgetTableDiv">
      <table className='widgetBodyTable'>
        <thead>
          <tr>
            <td>symbol</td>
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
    trackedStocks: that.props.widgetList[key]["trackedStocks"], //is this needed
    // trackedStockData: that.state.trackedStockData,
    updateGlobalStockList: that.props.updateGlobalStockList,
    updateWidgetStockList: that.props.updateWidgetStockList,
    widgetKey: key,
  };
  return propList;
}

export default MetricsWidget;
