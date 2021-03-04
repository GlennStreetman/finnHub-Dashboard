import React from "react";
import { connect } from "react-redux";
import Immutable from 'immutable';
const {getIn } = require('immutable');
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
  const thisExchange = getIn(state.exchangeData.exchangeData, [p.defaultExchange])
  const newFilteredList = []
  if (thisExchange !== undefined) {
    const availableStockCount = thisExchange.size;
    let thisSequence = Array.from(thisExchange.keys())
    for (let resultCount = 0, filteredCount = 0; 
      resultCount < 20 && filteredCount < availableStockCount; 
      filteredCount++) {
        let stockSearchPhrase = thisSequence[filteredCount]
        if (stockSearchPhrase.includes(p.inputText) === true) {
          resultCount = resultCount + 1;
          newFilteredList.push(stockSearchPhrase);
        }
      }

    return {rExchangeList: state.exchangeList.exchangeList,
      rFilteredStocks: newFilteredList,
    }
  }
}

export default connect(mapStateToProps)(StockDataList);
