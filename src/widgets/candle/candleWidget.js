import React from "react";
import StockSearchPane from "../../components/stockSearchPane.js";
import CreateCandleStickChart from "./createCandleStickChart.js";

class CandleWidget extends React.Component {
  constructor(props) {
    super(props);
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();
    let currentyDay = new Date().getDay();
    let lastMonth = new Date(currentYear - 1, currentMonth, currentyDay).toISOString().slice(0, 10);
    let startString = this.props.trackedStocks.length > 0 && this.props.trackedStocks[0].slice(this.props.trackedStocks[0].indexOf('-') + 1,this.props.trackedStocks[0].length)
    let startStock = this.props.trackedStocks.length > 0 ? startString : '';

    this.state = {
      startDate: lastMonth, //default prior month.
      endDate: new Date().toISOString().slice(0, 10), //default to today.
      candleSelection: startStock, //current stock to be graphed.
      candleData: { 0: "blank" }, //graph data.
      chartData: [],
      options: {}, //graph options
      resolution: "W",
      selectResolution: [1, 5, 15, 30, 60, "D", "W", "M"],
    };
    this.updateWidgetList = this.updateWidgetList.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getCandleData = this.getCandleData.bind(this);
    this.editCandleListForm = this.editCandleListForm.bind(this);
    this.displayCandleGraph = this.displayCandleGraph.bind(this);
    this.changeStockSelection = this.changeStockSelection.bind(this);
    this.createCandleDataList = this.createCandleDataList.bind(this);
    this.createChartOptions = this.createChartOptions.bind(this);
    this.changeResolutionSelection = this.changeResolutionSelection.bind(this);
  }

  componentDidMount() {
    if (this.props.trackedStocks.length > 0) {
      this.getCandleData();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.candleSelection !== prevState.candleSelection || this.props.showEditPane !== prevProps.showEditPane) {
      this.getCandleData();
    }
    if (this.state.candleSelection === '' && this.props.trackedStocks.length) {
      this.setState({ candleSelection: this.props.trackedStocks[0] });
    }
  }

  updateWidgetList(stock) {
    if (stock.indexOf(":") > 0) {
      const stockSymbole = stock.slice(0, stock.indexOf(":"));
      this.props.updateWidgetStockList(this.props.widgetKey, stockSymbole);
    } else {
      this.props.updateWidgetStockList(this.props.widgetKey, stock);
    }
  }

  handleChange(e) {
    const target = e.target;
    const name = target.name;
    this.setState({ [name]: e.target.value });
  }

  getCandleData() {
    // console.log('creating candle chart')
    if (this.props.apiKey !== '') {
      let candleStock = this.state.candleSelection
      let candleSymbol = candleStock.slice(candleStock.indexOf('-')+1 , candleStock.length)
      const s = this.state.startDate;
      const e = this.state.endDate;

      const startDateUnix = new Date(s.slice(0, 4), s.slice(5, 7), s.slice(8, 10)).getTime() / 1000;
      const endDateUnix = new Date(e.slice(0, 4), e.slice(5, 7), e.slice(8, 10)).getTime() / 1000;
      let that =  this
      that.props.throttle.enqueue(function() {
      fetch(
        "https://finnhub.io/api/v1/stock/candle?symbol=" +
          candleSymbol +
          "&resolution=" +
          that.state.resolution +
          "&from=" +
          startDateUnix +
          "&to=" +
          endDateUnix +
          "&token=" + that.props.apiKey
      )
        .then((response) => {
          if (response.status === 429) {
            that.props.throttle.openRequests = that.props.throttle.openRequests -= 1
            that.props.throttle.setSuspend(4000)
            that.getCandleData()
            throw new Error('finnhub 429')
          } else {
            // console.log(Date().slice(20,25) +  ': getCandleData ' + candleSymbol)
            that.props.throttle.openRequests = that.props.throttle.openRequests -= 1
            return response.json()
          }
        })
        .then((data) => {
          try {
            that.setState({ candleData: data });
            that.createCandleDataList(data);
          } catch (err) {
            console.log("Could not update candles. Component not mounted.");
          }
        })
        .catch(error => {
          console.log(error.message)
        });
      })
    }
  }

  createCandleDataList(data) {
    if (data["s"] !== "no_data") {
      let nodeCount = data["c"].length;
      // this.setState({ showChart: 0 });
      this.setState({ chartData: [] });
      for (let nodei = 0; nodei < nodeCount; nodei++) {
        let newNode = {
          x: new Date(data["t"][nodei] * 1000),
          y: [data["o"][nodei], data["h"][nodei], data["l"][nodei], data["c"][nodei]], //open, high, low, close
        };
        let updateChartData = this.state.chartData.slice();
        updateChartData.push(newNode);
        this.setState({ chartData: updateChartData });
      }
      this.createChartOptions();
    }
  }

  createChartOptions() {
    const options = {
      theme: "light2", // "light1", "light2", "dark1", "dark2"
      animationEnabled: true,
      exportEnabled: false,
      height: 400,
      width: 525,
      title: {
        text: this.state.candleSelection + ": " + this.state.startDate + " - " + this.state.endDate,
      },
      axisX: {
        valueFormatString: "YYYY-MM-DD",
      },
      axisY: {
        prefix: "$",
        title: "Price (in USD)",
      },
      data: [
        {
          type: "candlestick",
          showInLegend: true,
          name: this.state.candleSelection,
          yValueFormatString: "$###0.00",
          xValueFormatString: "YYYY-MM-DD",
          dataPoints: this.state.chartData,
        },
      ],
    };
    this.setState({ options: options });

    // this.setState({ showChart: 1 });
  }

  changeStockSelection(e) {
    const target = e.target.value;
    this.setState({ candleSelection: target });
  }

  changeResolutionSelection(e) {
    const target = e.target.value;
    this.setState({ resolution: target });
  }

  editCandleListForm() {
    let candleList = this.props.trackedStocks;

    let candleSelectionRow = candleList.map((el) =>
      this.props.showEditPane === 1 ? (
        <tr key={el + "container"}>
          <td key={el + "name"}>{el}</td>
          <td key={el + "buttonC"}>
            <button
              key={el + "button"}
              onClick={() => {
                this.updateWidgetList(el);
              }}
            >
              <i className="fa fa-times" aria-hidden="true" key={el + "icon"}></i>
            </button>
          </td>
        </tr>
      ) : (
        <tr key={el + "pass"}></tr>
      )
    );
    let stockCandleTable = (
      <table>
        <tbody>{candleSelectionRow}</tbody>
      </table>
    );
    return stockCandleTable;
  }

  displayCandleGraph() {
    let newSymbolList = this.props.trackedStocks.map((el) => (
      <option key={el + "ddl"} value={el}>
        {el}
      </option>
    ));

    let symbolSelectorDropDown = (
      <>
        <div className="div-inline">
          {"  Selection:  "}
          <select className="btn" value={this.state.candleSelection} onChange={this.changeStockSelection}>
            {newSymbolList}
          </select>
        </div>
        <div className="graphDiv">
          <CreateCandleStickChart candleData={this.state.options} candleSelection={this.state.candleSelection} />
        </div>
      </>
    );
    return symbolSelectorDropDown;
  }

  render() {
    let resolutionList = this.state.selectResolution.map((el) => (
      <option key={el + "rsl"} value={el}>
        {el}
      </option>
    ));

    return (
      <>
        {this.props.showEditPane === 1 && (
          <>
            <div className="searchPane">
              <StockSearchPane
                updateWidgetStockList={this.props.updateWidgetStockList}
                widgetKey={this.props.widgetKey}
                updateGlobalStockList={this.props.updateGlobalStockList}
                showSearchPane={() => this.props.showPane("showEditPane", 1)}
                getStockPrice={this.props.getStockPrice}
                apiKey={this.props.apiKey}
                throttle={this.props.throttle}
              />
              <div className="stockSearch">
                <form className="form-inline">
                  <label htmlFor="start">Start date:</label>
                  <input className="btn" id="start" type="date" name="startDate" onChange={this.handleChange} value={this.state.startDate}></input>
                  <label htmlFor="end">End date:</label>
                  <input className="btn" id="end" type="date" name="endDate" onChange={this.handleChange} value={this.state.endDate}></input>
                  <label htmlFor="resBtn">Resolution:</label>
                  <select id="resBtn" className="btn" value={this.state.resolution} onChange={this.changeResolutionSelection}>
                    {resolutionList}
                  </select>
                </form>
              </div>
            </div>
            <div>{Object.keys(this.props.trackedStocks).length > 0 ? this.editCandleListForm() : <></>}</div>
          </>
        )}
        {this.props.showEditPane === 0 && (
          <div className="graphDiv">{Object.keys(this.props.trackedStocks).length > 0 ? this.displayCandleGraph() : <></>}</div>
        )}
      </>
    );
  }
}

export function candleWidgetProps(that, key = "CandleWidget") {
  let propList = {
    apiKey: that.props.apiKey,
    // dashBoardData: that.props.getSavedDashBoards,
    // currentDashBoard: that.props.currentDashBoard,
    getStockPrice: that.getStockPrice,
    // getSavedDashBoards: that.props.getSavedDashBoards,
    // loadDashBoard: that.props.loadDashBoard,
    // saveCurrentDashboard: that.props.saveCurrentDashboard,
    showPane: that.showPane,
    trackedStocks: that.props.widgetList[key]["trackedStocks"],
    updateGlobalStockList: that.props.updateGlobalStockList,
    updateWidgetStockList: that.props.updateWidgetStockList,
    widgetKey: key,
    throttle: that.props.throttle,
  };
  return propList;
}

export default CandleWidget;
