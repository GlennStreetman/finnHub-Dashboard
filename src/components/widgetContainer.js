import React from "react";
import {widgetLookUp} from '../registers/widgetContainerReg.js'
  
//creates widget container. Used by all widgets.
class WidgetContainer extends React.Component {
  constructor(props) {
    super(props);
    // let showEditPaneOnRender = this.props.widgetLockDown === 0 ? 0 : 1;

    this.state = {
      renderHeader: this.props.widgetList["widgetHeader"],
      renderBody: this.props.widgetList["widgetType"],
      showEditPane: 0, //0: Hide, 1: Show
      show: 'block',
      searchText: '',
    };

    this.dragElement = this.dragElement.bind(this);
    this.showPane = this.showPane.bind(this);
    this.updateHeader = this.updateHeader.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.showWidget = this.showWidget.bind(this);
    this.changeSearchText = this.changeSearchText.bind(this);
  }

  componentDidMount(){
  const visable = this.showWidget()
  this.setState({show: visable})
  }

  componentDidUpdate(prevProps) {
    const p = this.props
    if (p.widgetLockDown !== prevProps.widgetLockDown) {
      this.setState({ showEditPane: 0 });
    }
    if (p.stateRef !== prevProps.stateRef || 
        p.showMenu !== prevProps.showMenu || 
        p.showStockWidgets !== prevProps.showStockWidgets) {
          const visable = this.showWidget()
          this.setState({show: visable})
    }
  }

  changeSearchText(text) {
    if (text !== '' && text !== undefined) { 
      this.setState({searchText: text})
    }
  }

  showPane(stateRef, fixState = -1) {
    let showMenu = this.state[stateRef] === 0 ? 1 : 0;
    fixState !== -1 && (showMenu = fixState);
    this.setState({ [stateRef]: showMenu });
  }

  updateHeader(e) {
    //changes widget name.
    this.setState({ renderHeader: e.target.value });
    this.props.changeWidgetName(this.props.stateRef, this.props.widgetKey, e.target.value);
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
      let newX = xAxis - widgetWidth + 25;
      let newY = yAxis - 25;
      that.props.moveWidget(that.props.stateRef, that.props.widgetKey, newY, newX);
    }

    function closeDragElement() {
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  showWidget(){
    if (this.props.stateRef === "menuList" && this.props.showMenu === 0){
      return "none"
    } else if (this.props.showStockWidgets === 0) {
      return "none"
    } else { 
      return "block"
    }
  }

  render() {
    //Add widgets to the list below that should not have access to the stock search pane
    const hideStockSearchMenu = ["DashBoardMenu"]


    const compStyle = {
      display: this.state.show,
      top: this.props.widgetList["xAxis"],
      left: this.props.widgetList["yAxis"],
      zIndex: this.props.zIndex.indexOf(this.props.widgetKey),
    };

    const that = this;
    let widgetProps = that.props.widgetBodyProps();
    if (this.props.widgetKey !== "dashBoardMenu") {
      widgetProps["showEditPane"] = that.state.showEditPane;
      widgetProps["showPane"] = that.showPane;
      widgetProps['searchText'] = this.state.searchText
      widgetProps['changeSearchText'] = this.changeSearchText
    } 

    return (
      <div key={this.props.widgetKey + "container" + this.state.show} id={this.props.widgetKey + "box"} 
      className="widgetBox" style={compStyle} onMouseOut={() => {this.props.updateZIndex(this.props.widgetKey)}}>
        {this.props.widgetLockDown === 0 ? (
          <div className="widgetHeader">
            {this.state.showEditPane === 0 ? (
              <>{this.state.renderHeader}</>
            ) : (
              <input type="text" id={this.props.widgetKey + "HeaderValue"} value={this.state.renderHeader} onChange={this.updateHeader} />
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

            {hideStockSearchMenu.indexOf(this.props.widgetKey) < 0 && (
              <button className="headerButtons" onClick={() => this.showPane("showEditPane", -1)}>
                <i className="fa fa-pencil-square-o" aria-hidden="true"></i>
              </button>
            )}
          </div>
        ) : (
          <div className="widgetHeader">{this.state.renderHeader}</div>
        )}

        {React.createElement(widgetLookUp[this.props.widgetList["widgetType"]], widgetProps)}

        <div className="widgetFooter">
          {this.props.widgetLockDown === 0 ? (
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
          ) : (
            <>-</>
          )}
        </div>
      </div>
    );
  }
}

export default WidgetContainer;
