import React, { Component } from 'react'
import StockSearchPane, {searchPaneProps} from "../../../components/stockSearchPane.js";
import {finnHub} from "../../../appFunctions/throttleQueue.js";
import RecTrendChart from "./recTrendChart.js";

export default class EstimatesRecommendationTrends extends Component {
    constructor(props) {
        super(props);
        this.state = {
          targetStock: '',
          stockData: undefined, //object
          chartOptions: undefined, //object defining chart options
        };

      this.baseState = {mounted: true}
      this.renderSearchPane = this.renderSearchPane.bind(this);
      this.renderStockData = this.renderStockData.bind(this);
      this.getStockData = this.getStockData.bind(this);
      this.updateFilter = this.updateFilter.bind(this);
      this.createChartDataList = this.createChartDataList.bind(this);
      this.createChartOptions = this.createChartOptions.bind(this);
      this.changeStockSelection = this.changeStockSelection.bind(this);
    }

    componentDidMount(){
      const p = this.props
      if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
        this.setState({...p.widgetCopy})
      } else {
        p.trackedStocks.sKeys()[0] !== undefined && this.setState({targetStock: p.trackedStocks.sKeys()[0]}, ()=>this.getStockData())
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
      //e should be click event.
      this.props.updateWidgetFilters(this.props.widgetKey, "filterName", e)
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
    
    changeStockSelection(e) {
      const target = e.target.value;
      this.setState({ targetStock: target }, ()=>this.getStockData());
    }

    createChartDataList() {
      const s = this.state

      const sOptions = ['strongSell', 'sell', 'hold', 'buy', 'strongBuy']
      const newChartData = {}
      for (const i in sOptions) { 
        newChartData[sOptions[i]] = {
          type: "stackedColumn",
          name: sOptions[i],
          showInLegend: "true",
          xValueFormatString: "DD, MMM",
          yValueFormatString: "#,##0",
          dataPoints: [] //populated by loop below
        }
      }
      const listSixData = s.stockData.slice(0, 12)
      const rawData = listSixData
      for (const i in rawData) {
        const node = rawData[i]
        for (const d in sOptions) {
          const dataPoint = node[sOptions[d]]
          const dataTime = node['period']
          const dataObject = {label: dataTime, y: dataPoint}
          newChartData[sOptions[d]]['dataPoints'].unshift(dataObject)
        }
      }

      this.createChartOptions(newChartData);
    }
  
    createChartOptions(chartData) {
      
      const options = {
      width: 400,
      height: 200,
      animationEnabled: true,
      exportEnabled: true,
			theme: "light1",
			title:{
        text: this.state.targetStock,
        fontFamily: "verdana"
			},
			axisY: {
        title: "",
				includeZero: true,
				prefix: "",
				suffix: ""
			},
			toolTip: {
        shared: true,
        reversed: true
			},
			legend:{
				verticalAlign: "center",
				horizontalAlign: "right",
				reversed: true,
				cursor: "pointer",
				itemclick: this.toggleDataSeries
			},
			data: []
      }

      for (const x in chartData) {
        options.data.push(chartData[x])
      }

      this.setState({ chartOptions: options });
  
      // this.setState({ showChart: 1 });
    }

    getStockData(){
      const p = this.props
      const s = this.state
      const target = p.trackedStocks[s.targetStock].symbol
      const that = this
      const queryString = `https://finnhub.io/api/v1/stock/recommendation?symbol=${target}&token=${p.apiKey}`
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
            // console.log(queryString,data)
            this.setState({stockData: data}, ()=>this.createChartDataList())
          }
        }
      })
      .catch(error => {
        console.log(error.message)
      });
    }

    renderStockData(){
      const s = this.state
      const p = this.props
      let newSymbolList = this.props.trackedStocks.sKeys().map((el) => (
        <option key={el + "ddl"} value={el}>
          {p.trackedStocks[el].dStock(p.exchangeList)}
        </option>
      ));

      let chartBody = (
        <>
          <div className="div-inline">
            {"  Selection:  "}
            <select className="btn" value={s.targetStock} onChange={this.changeStockSelection}>
              {newSymbolList}
            </select>
          </div>
          <div className="graphDiv">
            <RecTrendChart chartOptions={s.chartOptions} />
          </div>
        </>
      );
      return chartBody;
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
            {this.props.trackedStocks.sKeys().length > 0 && 
            this.props.showEditPane === 0  ? this.renderStockData() : <></>}       
          </>
        )
    }
  }

export function recommendationTrendsProps(that, key = "recommendationTrendsProps") {
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