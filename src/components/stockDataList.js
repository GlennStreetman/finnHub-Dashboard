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
    if (this.props.rFilteredStocks !== undefined) {
      const availableStocks = this.props.rFilteredStocks;
      const stockListKey = availableStocks.map((el) => (
        <option key={el + "op"} value={el}>
          {el}
        </option>
      ));
      return stockListKey;
    } 
    
  }

  render() {
    // console.log("rendering");
    return <>{this.createDataList()}</>;
  }
}

const mapStateToProps = (state, ownProps) => {
  const p = ownProps
  // console.log('exd------------', state.exchangeData.exchangeData?.data)
  const thisExchange = state.exchangeData.exchangeData?.data
  // console.log('!!!thisExchange', thisExchange)
  const newFilteredList = []
  if (thisExchange !== undefined) {
    const availableStockCount = Object.keys(thisExchange).length;
    // console.log(availableStockCount)
    const exchangeKeys = Object.keys(thisExchange) //list
    for (let resultCount = 0, filteredCount = 0; 
    resultCount < 20 && filteredCount < availableStockCount; 
    filteredCount++) {
      const thisKey = exchangeKeys[filteredCount]
      const thisSearchPhrase = `${thisExchange[thisKey].key}: ${thisExchange[thisKey].description}`
      if (thisSearchPhrase.includes(p.inputText) === true) {
        resultCount = resultCount + 1;
        newFilteredList.push(thisSearchPhrase);
      }
    }
    // console.log('newFilteredList', newFilteredList)
    return {
      rFilteredStocks: newFilteredList,
    }
  } else {
    // console.log("------------no exchange data loaded------")
    return {
      rFilteredStocks: undefined,
    }
  }
}

export default connect(mapStateToProps)(StockDataList);
