import React from "react";
import StockSearchPane from "../../stockSearchPane.js";
import CreateCandleStickChart from "./createCandleStickChart.js";

class CandleWidget extends React.Component {
  constructor(props) {
    super(props);
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();
    let currentyDay = new Date().getDay();
    let lastMonth = new Date(currentYear - 1, currentMonth, currentyDay).toISOString().slice(0, 10);
    let startStock = this.props.trackedStocks.length > 0 ? this.props.trackedStocks[0] : 1;

    this.state = {
      startDate: lastMonth, //default prior month.
      endDate: new Date().toISOString().slice(0, 10), //default to today.
      candleSelection: startStock, //current stock to be graphed.
      candleData: { 0: "blank" }, //graph data.
      // charData: [],
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
      this.getCandleData(this.state.candleSelection, this.state.startDate, this.state.endDate);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.candleSelection !== prevState.candleSelection || this.props.showEditPane !== prevProps.showEditPane) {
      this.getCandleData(this.state.candleSelection, this.state.startDate, this.state.endDate);
    }
    if (this.state.candleSelection === 1 && this.props.trackedStocks.length) {
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
    const s = this.state.startDate;
    const e = this.state.endDate;

    const startDateUnix = new Date(s.slice(0, 4), s.slice(5, 7), s.slice(8, 10)).getTime() / 1000;
    const endDateUnix = new Date(e.slice(0, 4), e.slice(5, 7), e.slice(8, 10)).getTime() / 1000;

    fetch(
      "https://finnhub.io/api/v1/stock/candle?symbol=" +
        this.state.candleSelection +
        "&resolution=" +
        this.state.resolution +
        "&from=" +
        startDateUnix +
        "&to=" +
        endDateUnix +
        "&token=bsuu7qv48v6qu589jlj0"
    )
      .then((response) => response.json())
      .then((data) => {
        try {
          this.setState({ candleData: data });
          this.createCandleDataList(data);
        } catch (err) {
          // console.log("Could not update candles. Component not mounted.");
        }
      });
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
        let updateChartData = this.state.chartData;
        updateChartData.push(newNode);
        this.setState({ chartData: updateChartData });
        this.createChartOptions();
      }
    }
  }

  createChartOptions() {
    const options = {
      theme: "light2", // "light1", "light2", "dark1", "dark2"
      animationEnabled: true,
      exportEnabled: false,
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
        <div>
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
            <div>
              <StockSearchPane
                updateWidgetStockList={this.props.updateWidgetStockList}
                widgetKey={this.props.widgetKey}
                updateGlobalStockList={this.props.updateGlobalStockList}
                showSearchPane={() => this.props.showPane("showEditPane", 1)}
                getStockPrice={this.props.getStockPrice}
                apiKey={this.props.apiKey}
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
        {this.props.showEditPane === 0 && <div>{Object.keys(this.props.trackedStocks).length > 0 ? this.displayCandleGraph() : <></>}</div>}
      </>
    );
  }
}
export default CandleWidget;
