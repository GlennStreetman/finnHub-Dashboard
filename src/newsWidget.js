import React from "react";
import StockSearchPane from "./stockSearchPane.js";
// import Moment from "react-moment";

class NewsWidget extends React.Component {
  constructor(props) {
    super(props);
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();
    let currentyDay = new Date().getDay();
    let lastMonth = new Date(currentYear, currentMonth - 1, currentyDay).toISOString().slice(0, 10);
    this.state = {
      widgetList: [],
      companyNews: [],
      startDate: lastMonth,
      endDate: new Date().toISOString().slice(0, 10),
      newsSelection: 1,
      newsIncrementor: 1,
    };
    this.getCompanyNews = this.getCompanyNews.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.updateWidgetList = this.updateWidgetList.bind(this);
    this.editNewsListForm = this.editNewsListForm.bind(this);
    this.displayNews = this.displayNews.bind(this);
    this.changeNewsSelection = this.changeNewsSelection.bind(this);
    this.newsTable = this.newsTable.bind(this);
    this.changeIncrememnt = this.changeIncrememnt.bind(this);
    this.formatSourceName = this.formatSourceName.bind(this);
    this.shortHeadline = this.shortHeadline.bind(this);
  }

  formatSourceName(source) {
    let formattedSource = source;
    formattedSource = formattedSource.replace(".com", "");
    formattedSource = formattedSource.replace("http:", "");
    formattedSource = formattedSource.replace("https:", "");
    formattedSource = formattedSource.replace("//", "");
    formattedSource = formattedSource.replace("www.", "");
    formattedSource = formattedSource.replace("wsj", "Wall Street Journal");
    formattedSource = formattedSource.replace(formattedSource[0], formattedSource[0].toUpperCase());

    return formattedSource;
  }

  shortHeadline(headline) {
    let shortHeadLine = headline.slice(0, 48) + "...";
    return shortHeadLine;
  }

  getCompanyNews(symbol, fromDate, toDate) {
    fetch("https://finnhub.io/api/v1/company-news?symbol=" + symbol + "&from=" + fromDate + "&to=" + toDate + "&token=bsuu7qv48v6qu589jlj0")
      .then((response) => response.json())
      .then((data) => {
        //filter spam from seekingAlpha.com. They format article dates to always return first blocking out all other sources.
        let filteredNews = [];
        let newsCount = 0;
        for (var news in data) {
          if (data[news]["source"] !== "seekingalpha.com" && newsCount < 100) {
            filteredNews.push(data[news]);
            newsCount += 1;
          }
        }
        this.setState({ companyNews: filteredNews });
      });
  }

  changeIncrememnt(e) {
    const newIncrement = this.state.newsIncrementor + e;
    if (newIncrement > 0 && newIncrement < 11) this.setState({ newsIncrementor: newIncrement });
  }

  handleChange(e) {
    const target = e.target;
    const name = target.name;
    this.setState({ [name]: e.target.value });
  }

  changeNewsSelection(e) {
    const target = e.target.value;
    this.setState({ newsSelection: target });
    this.getCompanyNews(this.state.newsSelection, this.state.startDate, this.state.endDate);
    this.setState({ newsIncrementor: 1 });
  }

  updateWidgetList(stock) {
    // console.log("it ran");
    var stockSymbole = stock.slice(0, stock.indexOf(":"));
    var newWidgetList = this.state.widgetList.slice();
    newWidgetList.push(stockSymbole);
    this.setState({ widgetList: newWidgetList });

    if (this.state.newsSelection === 1) {
      // console.log("working");
      this.setState({ newsSelection: stockSymbole });
      this.getCompanyNews(stockSymbole, this.state.startDate, this.state.endDate);
    }
  }

  editNewsListForm() {
    let newsList = this.state.widgetList;

    let stockNewsRow = newsList.map((el) =>
      this.props.showEditPane === 1 ? (
        <>
          <tr>
            <td>{el}</td>
            <td>
              <button
                onClick={() => {
                  let oldList = Array.from(this.state.widgetList);
                  oldList.splice(oldList.indexOf({ el }), 1);
                  this.setState({ widgetList: oldList });
                }}
              >
                <i className="fa fa-times" aria-hidden="true"></i>
              </button>
            </td>
          </tr>
        </>
      ) : (
        <></>
      )
    );
    let stockNewsTable = (
      <table>
        <tbody>{stockNewsRow}</tbody>
      </table>
    );
    return stockNewsTable;
  }

  newsTable() {
    let increment = 10 * this.state.newsIncrementor;
    let newStart = increment - 10;
    let newsEnd = increment;
    let newsSlice = this.state.companyNews.slice(newStart, newsEnd);
    let mapNews = newsSlice.map((el) => (
      <tr>
        <td>{this.formatSourceName(el["source"])}</td>
        <td>
          <a href={el["url"]} target="_blank">
            {this.shortHeadline(el["headline"])}
          </a>
        </td>
      </tr>
    ));

    let thisnewsTable = (
      <div className="newsBody">
        <table>
          <thead>
            <tr>
              <td>Source</td>
              <td>Headline</td>
            </tr>
          </thead>
          <tbody>{mapNews}</tbody>
        </table>
      </div>
    );
    return thisnewsTable;
  }

  displayNews() {
    let newSymbolList = this.state.widgetList.map((el) => (
      <option key={el + "ddl"} value={el}>
        {el}
      </option>
    ));

    let symbolSelectorDropDown = (
      <>
        <div>
          <select value={this.state.newsSelection} onChange={this.changeNewsSelection}>
            {newSymbolList}
          </select>
          <button onClick={() => this.changeIncrememnt(-1)}>
            <i className="fa fa-backward" aria-hidden="true"></i>
          </button>
          <button onClick={() => this.changeIncrememnt(1)}>
            <i className="fa fa-forward" aria-hidden="true"></i>
          </button>
        </div>
        <div>{this.newsTable()}</div>
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
                availableStocks={this.props.availableStocks}
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
            <div>{Object.keys(this.state.widgetList).length > 0 ? this.editNewsListForm() : <></>}</div>
          </>
        )}

        {this.props.showEditPane === 0 && <div>{Object.keys(this.state.widgetList).length > 0 ? this.displayNews() : <></>}</div>}
      </>
    );
  }
}
export default NewsWidget;

//date, source, Headline(underlying hyperlink)
