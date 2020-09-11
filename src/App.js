import React from "react";
import "./App.css";
import TopNav from "./topNav.js";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      stockTrackingList: [],
      widgetList: {},
    };
    this.UpdateStockTrackingList = this.UpdateStockTrackingList.bind(this);
    this.newStockWidget = this.newStockWidget.bind(this);
    this.removeWidget = this.removeWidget.bind(this);
  }

  newStockWidget(widgetDescription, widgetHeader) {
    const widgetName = new Date().getTime();
    var newWidgetList = Object.assign({}, this.state.widgetList);
    newWidgetList[widgetName] = {
      widgetID: widgetName,
      widgetType: widgetDescription,
      widgetHeader: widgetHeader,
      trackedStocks: "blank",
    };
    this.setState({ widgetList: newWidgetList });
  }

  removeWidget(widgetID) {
    let newWidgetList = Object.assign(this.state.widgetList);
    delete newWidgetList[widgetID];
    this.setState({ widgetList: newWidgetList });
  }

  UpdateStockTrackingList(event, stockDescription) {
    const addStockID = stockDescription.slice(0, stockDescription.indexOf(":"));
    // console.log(addStockID);
    var currentStockList = Array.from(this.state.stockTrackingList);

    if (currentStockList.includes(addStockID) === false) {
      currentStockList.push(addStockID);
      this.setState({ stockTrackingList: currentStockList });
    }

    event.preventDefault();
  }

  render() {
    // let widgetState = this.state.widgetList;
    // let widgetRender = Object.keys(widgetState).map((el) => <WidgetControl key={el} widgetKey={el} widgetList={widgetState[el]} />);
    return (
      <>
        <TopNav
          availableStocks={this.state.availableStocks}
          stockTrackingList={this.state.stockTrackingList}
          widgetList={this.state.widgetList}
          UpdateStockTrackingList={this.UpdateStockTrackingList}
          newStockWidget={this.newStockWidget}
          removeWidget={this.removeWidget}
        />
      </>
    );
  }
}

export default App;
