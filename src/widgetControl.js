import React from "react";

class WidgetControl extends React.Component {
  //creates widget container.
  constructor(props) {
    super(props);

    this.state = {
      xAxis: "40px",
      yAxis: "40px",
      renderHeader: this.props.widgetList["widgetHeader"],
      renderBody: this.props.widgetList["widgetType"],
      showEditPane: 0,
    };

    this.dragElement = this.dragElement.bind(this);
    this.showPane = this.showPane.bind(this);
    this.updateHeader = this.updateHeader.bind(this);
  }

  showPane(stateRef) {
    console.log("showpress");
    let showMenu = this.state[stateRef] === 0 ? 1 : 0;
    this.setState({ [stateRef]: showMenu });
  }

  updateHeader(newHeader) {
    this.setState({ renderHeader: newHeader });
  }

  dragElement() {
    let that = this;
    // let pos1 = 0;
    // let pos2 = 0;
    let pos3 = 0;
    let pos4 = 0;

    document.getElementById(this.props.widgetList["widgetID"]).onmousedown = dragMouseDown;

    function dragMouseDown(e) {
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
      // calculate the new cursor position:
      // letpos1 = pos3 - e.clientX;
      // pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      let newX = pos3;
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
      <div className="widgetBox" style={compStyle}>
        <div className="widgetHeader">
          <div>{this.state.renderHeader} </div>
          <div>
            <button onClick={() => this.showPane("showEditPane")}>
              <i className="fa fa-pencil-square-o" aria-hidden="true"></i>
            </button>
            <button
              id={this.props.widgetList["widgetID"]}
              onMouseOver={() => {
                this.dragElement();
              }}
            >
              <i className="fa fa-arrows" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        {React.createElement(this.props.widgetList["widgetType"], {
          availableStocks: that.props.availableStocks,
          UpdateStockTrackingList: that.props.UpdateStockTrackingList,
          getStockPrice: that.props.getStockPrice,
          showEditPane: that.state.showEditPane,
          showPane: that.showPane,
          updateHeader: that.updateHeader,
          trackedStockData: that.props.trackedStockData,
        })}
      </div>
    );
  }
}

export default WidgetControl;
