import React from "react";
import {finnHub} from "../../../appFunctions/throttleQueue.js";

export default class FundamentalsMarketNews extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      companyNews: [],
      categoryList: ['general', 'forex', 'crypto', 'merger'],
    //   categorySelection: 'general',
      newsIncrementor: 1,
    };
    
    this.baseState = {mounted: true}
    this.getCompanyNews = this.getCompanyNews.bind(this);
    this.updateFilter = this.updateFilter.bind(this);
    this.displayNews = this.displayNews.bind(this);
    this.changeCategory = this.changeCategory.bind(this);
    this.newsTable = this.newsTable.bind(this);
    this.changeIncrememnt = this.changeIncrememnt.bind(this);
    this.formatSourceName = this.formatSourceName.bind(this);
    this.shortHeadline = this.shortHeadline.bind(this);
  }

  componentDidMount() {
    this.getCompanyNews();
  }


  componentWillUnmount(){
    this.baseState.mounted = false
    this.updateFilter('general')
    // this.getCompanyNews()
  }

  updateFilter(e) {
      this.props.updateWidgetFilters(this.props.widgetKey, "categorySelection", e)
      this.getCompanyNews()
  }

  formatSourceName(source) {
    //clean up source names for news articles.
    let formattedSource = source;
    if (formattedSource !== undefined) {
    formattedSource = formattedSource.replace(".com", "");
    formattedSource = formattedSource.replace("http:", "");
    formattedSource = formattedSource.replace("https:", "");
    formattedSource = formattedSource.replace("//", "");
    formattedSource = formattedSource.replace("www.", "");
    formattedSource = formattedSource.replace("wsj", "Wall Street Journal");
    formattedSource = formattedSource.replace(formattedSource[0], formattedSource[0].toUpperCase());
    }
    return formattedSource;
  }

  shortHeadline(headline) {
    let shortHeadLine = headline.slice(0, 48) + "...";
    return shortHeadLine;
  }
  
  getCompanyNews() {
    const p = this.props
    const s = this.state
    if (p.apiKey !== '') {
      let that = this
      let querryString = `https://finnhub.io/api/v1/news?category=${p.filters.categorySelection}&token=${p.apiKey}` 
      finnHub(p.throttle, querryString)
        .then((data) => {
          if (this.baseState.mounted === true) {
            const filteredNews = [];
            let newsCount = 0;
            for (const news in data) {
              if (data[news]["source"] !== "seekingalpha.com" && newsCount < 100) {
                filteredNews.push(data[news]);
                newsCount += 1;
              }
            }
            try {
              that.setState({ companyNews: filteredNews });
            } catch (err) {
              console.log("Could not update news.");
            }
          }
        })
        .catch(error => {
          console.log(error.message)
        });
      // })
    }
  }

  changeIncrememnt(e) {
    const newIncrement = this.state.newsIncrementor + e;
    if (newIncrement > 0 && newIncrement < 11) this.setState({ newsIncrementor: newIncrement });
  }

  changeCategory(e) { //needs to update category selection.
        const target = e.target.value;
        // this.setState({ categorySelection: target });
        this.updateFilter(target)
        this.setState({ newsIncrementor: 1 });
    }

  newsTable() {
    let increment = 10 * this.state.newsIncrementor;
    let newStart = increment - 10;
    let newsEnd = increment;
    let newsSlice = this.state.companyNews.slice(newStart, newsEnd);
    let mapNews = newsSlice.map((el, index) => (
      <tr key={el + "newsRow" + index}>
        <td key={el + "newsSource"}>{this.formatSourceName(el["source"])}</td>
        <td key={el + "newsHeadline"}>
          <a key={el + "newsUrl"} href={el["url"]} target="_blank" rel="noopener noreferrer">
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
    const s = this.state
    let newSymbolList = s.categoryList.map((el) => (
      <option key={el + "ddl"} value={el}>
        {el}
      </option>
    ));

    let symbolSelectorDropDown = (
      <>
        <div>
          <select value={s.newsSelection} onChange={this.changeCategory}>
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
       { this.displayNews()}
    </>
    )}
}

export function marketNewsProps(that, key = "marketNews") {
  let propList = {
    apiKey: that.props.apiKey,
    filters: that.props.widgetList[key]["filters"],
    showPane: that.showPane,
    throttle: that.props.throttle,
    trackedStocks: that.props.widgetList[key]["trackedStocks"],
    updateGlobalStockList: that.props.updateGlobalStockList,
    updateWidgetFilters: that.props.updateWidgetFilters,
    updateWidgetStockList: that.props.updateWidgetStockList,
    widgetKey: key,
    exchangeList: that.props.exchangeList,
    defaultExchange: that.props.defaultExchange,
    updateDefaultExchange: that.props.updateDefaultExchange,

  };
  return propList;
}

