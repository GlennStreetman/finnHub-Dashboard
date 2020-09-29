import React from "react";
import StockDetailWidget from "./stockDetails/stockDetailWidget.js";
import NewsWidget from "./News/newsWidget.js";
import CandleWidget from "./candle/candleWidget.js";
import DashBoardMenu from "./dashBoardMenu/dashBoardMenu.js";
import WatchListMenu from "./watchListMenu/watchListMenu.js";

//creates widget container. Used by all widgets.
class WidgetControl extends React.Component {
  constructor(props) {
    super(props);
    // let showEditPaneOnRender = this.props.widgetLockDown === 0 ? 0 : 1;

    this.state = {
      renderHeader: this.props.widgetList["widgetHeader"],
      renderBody: this.props.widgetList["widgetType"],
      showEditPane: 0, //0: Hide, 1: Show
    };

    this.dragElement = this.dragElement.bind(this);
    this.showPane = this.showPane.bind(this);
    this.updateHeader = this.updateHeader.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.widgetLockDown !== prevProps.widgetLockDown) {
      this.setState({ showEditPane: 0 });
    }
  }

  showPane(stateRef, fixState: -1) {
    let showMenu = this.state[stateRef] === 0 ? 1 : 0;
    fixState !== -1 && (showMenu = fixState);
    this.setState({ [stateRef]: showMenu });
  }

  updateHeader(newHeader) {
    //changes widget name.
    this.setState({ renderHeader: newHeader });
  }

  handleChange(e) {
    this.setState({ renderHeader: e.target.value });
  }

  dragElement() {
    let that = this;
    let xAxis = 0;
    let yAxis = 0;

    document.getElementById(this.props.widgetList["widgetID"]).onmousedown = dragMouseDown;
    let widgetWidth = document.getElementById(this.props.widgetKey + "box").clientWidth;

    function dragMouseDown(e) {
      that.setState({ showEditPane: 0 });
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      xAxis = e.clientX;
      yAxis = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();

      xAxis = e.clientX;
      yAxis = e.clientY;
      // set the element's new position:
      let newX = xAxis - widgetWidth;
      let newY = yAxis;
      // that.setState({ yAxis: newY });
      // that.setState({ xAxis: newX });
      that.props.moveWidget(that.props.stateRef, that.props.widgetKey, newY, newX);
    }

    function closeDragElement() {
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  render() {
    // console.log("rendering");
    const compStyle = {
      display: "block",
      top: this.props.widgetList["xAxis"],
      left: this.props.widgetList["yAxis"],
      opacity: ["DashBoardMenu", "WatchListMenu"].indexOf(this.state.renderBody) > -1 && this.props.showMenu === 0 ? 0 : 100,
    };

    let widgetList = {
      StockDetailWidget: StockDetailWidget,
      NewsWidget: NewsWidget,
      CandleWidget: CandleWidget,
      DashBoardMenu: DashBoardMenu,
      WatchListMenu: WatchListMenu,
    };

    const that = this;
    return (
      <div key={this.props.widgetKey + "container"} id={this.props.widgetKey + "box"} className="widgetBox" style={compStyle}>
        {this.props.widgetLockDown === 0 ? (
          <div className="widgetHeader">
            {this.state.showEditPane === 0 ? (
              <>{this.state.renderHeader}</>
            ) : (
              <input type="text" id={this.props.widgetKey + "HeaderValue"} value={this.state.renderHeader} onChange={this.handleChange} />
            )}

            <button
              className="headerButtons"
              id={this.props.widgetList["widgetID"]}
              onMouseOver={() => {
                this.dragElement();
              }}
            >
              <i className="fa fa-arrows" aria-hidden="true"></i>
            </button>
            {this.props.widgetKey !== "DashBoardMenu" && (
              <button className="headerButtons" onClick={() => this.showPane("showEditPane", -1)}>
                <i className="fa fa-pencil-square-o" aria-hidden="true"></i>
              </button>
            )}
          </div>
        ) : (
          <div className="widgetHeader">{this.state.renderHeader}</div>
        )}

        {React.createElement(widgetList[this.props.widgetList["widgetType"]], {
          apiKey: that.props.apiKey,
          updateGlobalStockList: that.props.updateGlobalStockList,
          getStockPrice: that.props.getStockPrice,
          showEditPane: that.state.showEditPane,
          showPane: that.showPane,
          trackedStockData: that.props.trackedStockData,
          widgetKey: that.props.widgetKey,
          globalStockList: that.props.globalStockList,
          updateWidgetStockList: that.props.updateWidgetStockList,
          trackedStocks: that.props.widgetList["trackedStocks"],
          loadDashBoard: that.props.loadDashBoard,
          saveCurrentDashboard: that.props.saveCurrentDashboard,
          menuWidgetToggle: that.props.menuWidgetToggle,
          getSavedDashBoards: that.props.getSavedDashBoards,
          dashBoardData: that.props.dashBoardData,
          currentDashBoard: that.props.currentDashBoard,
        })}

        {this.props.widgetLockDown === 0 ? (
          <div className="widgetFooter">
            <button
              onClick={() => {
                if (this.props.stateRef === "widgetList") {
                  this.props.removeWidget(this.props.stateRef, this.props.widgetKey);
                } else {
                  this.props.menuWidgetToggle(this.props.widgetKey);
                }
              }}
            >
              <i className="fa fa-times" aria-hidden="true"></i>
            </button>
          </div>
        ) : (
          <></>
        )}
      </div>
    );
  }
}

export default WidgetControl;
