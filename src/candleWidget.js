import React from "react";
import StockSearchPane from "./stockSearchPane.js";
import CreateCandleStickChart from "./createCandleStickChart.js";

class CandleWidget extends React.Component {
  constructor(props) {
    super(props);
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();
    let currentyDay = new Date().getDay();
    let lastMonth = new Date(currentYear - 1, currentMonth, currentyDay).toISOString().slice(0, 10);

    this.state = {
      widgetList: [],
      startDate: lastMonth,
      endDate: new Date().toISOString().slice(0, 10),
      candleSelection: 1,
      candleData: { 0: "blank" },
    };
    this.updateWidgetList = this.updateWidgetList.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getCandleData = this.getCandleData.bind(this);
    this.editCandleListForm = this.editCandleListForm.bind(this);
    this.displayCandleGraph = this.displayCandleGraph.bind(this);
    this.changeStockSelection = this.changeStockSelection.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.candleSelection !== prevState.candleSelection) {
      this.getCandleData(this.state.candleSelection, this.state.startDate, this.state.endDate);
    }
  }

  updateWidgetList(stock) {
    // console.log("it ran");
    var stockSymbole = stock.slice(0, stock.indexOf(":"));
    var newWidgetList = this.state.widgetList.slice();
    newWidgetList.push(stockSymbole);
    this.setState({ widgetList: newWidgetList });
    if (this.state.candleSelection === 1) {
      // console.log("working");
      this.setState({ candleSelection: stockSymbole });
      // this.getCompanyNews(stockSymbole, this.state.startDate, this.state.endDate);
    }
  }

  handleChange(e) {
    // console.log("handle change");
    const target = e.target;
    const name = target.name;
    this.setState({ [name]: e.target.value });
  }

  getCandleData() {
    const s = this.state.startDate;
    const e = this.state.endDate;
    console.log(this.state.startDate);
    const startDateUnix = new Date(s.slice(0, 4), s.slice(5, 7), s.slice(8, 10)).getTime() / 1000;
    const endDateUnix = new Date(e.slice(0, 4), e.slice(5, 7), e.slice(8, 10)).getTime() / 1000;
    console.log(startDateUnix, " ", endDateUnix, " ", this.state.candleSelection);
    fetch(
      "https://finnhub.io/api/v1/stock/candle?symbol=" +
        this.state.candleSelection +
        "&resolution=W&from=" +
        startDateUnix +
        "&to=" +
        endDateUnix +
        "&token=bsuu7qv48v6qu589jlj0"
    )
      .then((response) => response.json())
      .then((data) => {
        this.setState({ candleData: data });
        // console.log(data);
      });
  }

  changeStockSelection(e) {
    const target = e.target.value;
    this.setState({ candleSelection: target });
  }

  editCandleListForm() {
    let candleList = this.state.widgetList;

    let candleSelectionRow = candleList.map((el) =>
      this.props.showEditPane === 1 ? (
        <tr key={el + "container"}>
          <td key={el + "name"}>{el}</td>
          <td key={el + "buttonC"}>
            <button
              key={el + "button"}
              onClick={() => {
                let oldList = Array.from(this.state.widgetList);
                oldList.splice(oldList.indexOf({ el }), 1);
                this.setState({ widgetList: oldList });
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
    let newSymbolList = this.state.widgetList.map((el) => (
      <option key={el + "ddl"} value={el}>
        {el}
      </option>
    ));

    let symbolSelectorDropDown = (
      <>
        <div>
          <select value={this.state.candleSelection} onChange={this.changeStockSelection}>
            {newSymbolList}
          </select>
        </div>
        <div>
          <CreateCandleStickChart candleData={this.state.candleData} />
          {/* <CreateCandleStickChart candleData={this.state.candleData} type="svg" width="400px" /> */}
        </div>
      </>
    );
    return symbolSelectorDropDown;
  }

  render() {
    return (
      <>
        {this.props.showEditPane === 1 && (
          <>
            <div>
              <StockSearchPane
                // availableStocks={this.props.availableStocks}
                UpdateStockTrackingList={this.props.UpdateStockTrackingList}
                showSearchPane={() => this.props.showPane("showEditPane")}
                getStockPrice={this.props.getStockPrice}
                updateWidgetList={this.updateWidgetList}
              />
              <div className="stockSearch">
                <form className="form-inline">
                  <label htmlFor="start">Start date:</label>
                  <input id="start" type="date" name="startDate" onChange={this.handleChange} value={this.state.startDate}></input>
                  <label htmlFor="end">End date:</label>
                  <input id="end" type="date" name="endDate" onChange={this.handleChange} value={this.state.endDate}></input>
                </form>
              </div>
            </div>
            <div>{Object.keys(this.state.widgetList).length > 0 ? this.editCandleListForm() : <></>}</div>
          </>
        )}
        {this.props.showEditPane === 0 && <div>{Object.keys(this.state.widgetList).length > 0 ? this.displayCandleGraph() : <></>}</div>}
      </>
    );
  }
}
export default CandleWidget;
