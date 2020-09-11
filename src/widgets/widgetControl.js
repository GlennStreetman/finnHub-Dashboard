import React from "react";

//creates widget container. Used by all widgets.
class WidgetControl extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      xAxis: "40px",
      yAxis: "40px",
      renderHeader: this.props.widgetList["widgetHeader"],
      renderBody: this.props.widgetList["widgetType"],
      showEditPane: 1,
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

  showPane(stateRef) {
    //console.log("showpress");
    let showMenu = this.state[stateRef] === 0 ? 1 : 0;
    this.setState({ [stateRef]: showMenu });
  }

  updateHeader(newHeader) {
    this.setState({ renderHeader: newHeader });
  }

  handleChange(e) {
    this.setState({ renderHeader: e.target.value });
  }

  dragElement() {
    let that = this;
    let pos3 = 0;
    let pos4 = 0;

    document.getElementById(this.props.widgetList["widgetID"]).onmousedown = dragMouseDown;
    let widgetWidth = document.getElementById(this.props.widgetKey + "box").clientWidth;
    // console.log(widgetWidth);

    function dragMouseDown(e) {
      that.setState({ showEditPane: 0 });
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();

      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      let newX = pos3 - widgetWidth;
      let newY = pos4;
      that.setState({ yAxis: newY });
      that.setState({ xAxis: newX });
    }

    function closeDragElement() {
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  render() {
    const compStyle = {
      display: "block",
      top: this.state.yAxis,
      left: this.state.xAxis,
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

            <button className="headerButtons" onClick={() => this.showPane("showEditPane")}>
              <i className="fa fa-pencil-square-o" aria-hidden="true"></i>
            </button>
          </div>
        ) : (
          <div className="widgetHeader">{this.state.renderHeader}</div>
        )}

        {React.createElement(this.props.widgetList["widgetType"], {
          availableStocks: that.props.availableStocks,
          UpdateStockTrackingList: that.props.UpdateStockTrackingList,
          getStockPrice: that.props.getStockPrice,
          showEditPane: that.state.showEditPane,
          showPane: that.showPane,
          // updateHeader: that.updateHeader,
          trackedStockData: that.props.trackedStockData,
          widgetKey: that.props.widgetKey,
          stockTrackingList: that.props.stockTrackingList,
        })}

        {this.props.widgetLockDown === 0 ? (
          <div className="widgetFooter">
            <button onClick={() => this.props.removeWidget(this.props.widgetKey)}>
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
