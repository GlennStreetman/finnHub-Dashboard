import React from "react";
import StockSearchPane from "./stockSearchPane.js";

class StockDetailWidget extends React.Component {
  //Widget body component. Shows stock detail info and recent news. Maybe a graph?
  constructor(props) {
    super(props);
    this.state = {
      widgetList: "",
    };

    this.updateWidgetList = this.updateWidgetList.bind(this);
    this.renderStockData = this.renderStockData.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.widgetList !== prevState.widgetList) {
      this.props.updateHeader(this.state.widgetList);
    }
  }

  updateWidgetList(stock) {
    this.setState({ widgetList: stock });
  }

  renderStockData() {
    let trackedStockData = this.props.trackedStockData;
    let thisStock = this.state.widgetList;
    let thisStockSymbol = thisStock.slice(0, thisStock.indexOf(":"));
    let thisStockData = trackedStockData[thisStockSymbol];
    console.log(thisStockData);
    return thisStockData;
  }

  render() {
    return (
      <>
        {this.props.showEditPane === 1 && (
          <StockSearchPane
            availableStocks={this.props.availableStocks}
            UpdateStockTrackingList={this.props.UpdateStockTrackingList}
            showSearchPane={() => this.props.showPane("showEditPane")}
            getStockPrice={this.props.getStockPrice}
            updateWidgetList={this.updateWidgetList}
          />
        )}
        Test Body
        {this.renderStockData}
      </>
    );
  }
}

export default StockDetailWidget;
