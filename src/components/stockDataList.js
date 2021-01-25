import React from "react";
import { connect } from "react-redux";
//list of stock data used for auto complete on stock search.
class StockDataList extends React.Component {
  constructor(props) {
    super(props);
    this.createDataList = this.createDataList.bind(this);
  }

  createDataList() {
    //creates datalist used for autocomplete of stock names.
    const availableStocks = this.props.rFilteredStocks;
    const stockListKey = availableStocks.map((el) => (
      <option key={el + "op"} value={el}>
        {el}
      </option>
    ));
    return stockListKey;
  }

  render() {
    // console.log("rendering");
    return <>{this.createDataList()}</>;
  }
}

const mapStateToProps = (state, ownProps) => {
  const p = ownProps
  const exchangeData = state.exchangeData[p.defaultExchange]
  const newFilteredList = []
  const availableStockCount = exchangeData !== undefined ?  Object.keys(exchangeData).length : 0;
  const stockList = exchangeData !== undefined ? Object.keys(exchangeData): []
  
  for (let resultCount = 0, filteredCount = 0; 
    resultCount < 20 && filteredCount < availableStockCount; 
    filteredCount++) {
      let stockSearchPhrase = exchangeData[stockList[filteredCount]]['symbol'].toUpperCase() +
        '-' + 
        exchangeData[stockList[filteredCount]]['description'].toUpperCase()
      if (stockSearchPhrase.includes(p.inputText) === true) {
        resultCount = resultCount + 1;
        newFilteredList.push(stockSearchPhrase);
        // filterObject[stockList[filteredCount]] = stockListObject[stockList[filteredCount]] 
      }
    }

  return {rExchangeList: state.exchangeList.exchangeList,
    rFilteredStocks: newFilteredList,
  }
}

export default connect(mapStateToProps)(StockDataList);
