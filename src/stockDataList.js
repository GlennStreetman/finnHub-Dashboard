import React from "react";

//list of stock data used for auto complete on stock search.
class StockDataList extends React.PureComponent {
  constructor(props) {
    super(props);
    this.createDataList = this.createDataList.bind(this);
  }

  createDataList() {
    //creates datalist used for autocomplete of stock names.
    const availableStocks = this.props.availableStocks;
    //should i consider chaning the available stock prop into a map to begin with?
    const stockListKey = Object.values(availableStocks).map((el, ke) => (
      <option key={ke + "op"} value={el["displaySymbol"] + ": " + el["description"]}>
        {el["displaySymbol"] + ": " + el["description"]}
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
