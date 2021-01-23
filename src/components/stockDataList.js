import React from "react";
//list of stock data used for auto complete on stock search.
class StockDataList extends React.Component {
  constructor(props) {
    super(props);
    this.createDataList = this.createDataList.bind(this);
  }

  createDataList() {
    //creates datalist used for autocomplete of stock names.
    const availableStocks = this.props.availableStocks;
    const stockListKey = availableStocks.map((el) => (
      <option key={el + "op"} value={el}>
        {el.symbol}
      </option>
    ));
    return stockListKey;
  }

  render() {
    // console.log("rendering");
    return <>{this.createDataList()}</>;
  }
}

export default StockDataList;
