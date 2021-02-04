import React from "react";
import {widgetLookUp} from '../registers/widgetContainerReg.js'
import ToolTip from './../components/toolTip.js'

//creates widget container. Used by all widgets.
class WidgetContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      renderHeader: this.props.widgetList["widgetHeader"],
      renderBody: this.props.widgetList["widgetType"],
      showEditPane: 0, //0: Hide, 1: Show
      show: 'block',
      searchText: '',
    };

    this.widgetRef = React.createRef();
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
    const widgetState = this.widgetRef.current;
    widgetState.state.widgetID = this.props.widgetList.widgetID
    let that = this;
    let xAxis = 0;
    let yAxis = 0;

    document.getElementById(this.props.widgetList["widgetID"]).onmousedown = dragMouseDown;
    // let widgetWidth = document.getElementById(this.props.widgetKey + "box").clientWidth;
    let widgetWidth = 200

    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();

      xAxis = e.clientX + window.scrollX
      yAxis = e.clientY 
      that.props.setDrag(that.props.stateRef, that.props.widgetKey)
      .then((data)=>{
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
      })
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();

      xAxis = e.clientX + window.scrollX;
      yAxis = e.clientY + window.scrollY;
      
      let newX = xAxis - widgetWidth + 25 >= 5 ? xAxis - widgetWidth + 25 : 5
      let newY = yAxis - 25 >= 60 ? yAxis - 25 : 60

      that.props.moveWidget(that.props.stateRef, that.props.widgetKey, newX, newY, widgetState.state);
    }

    function closeDragElement(e) {
      // stop moving when mouse button is released:
      // if (this.props.widgetList.column !== "drag") { 
      xAxis = e.clientX + window.scrollX;
      yAxis = e.clientY + window.scrollY;
      let newX = xAxis - widgetWidth + 25 >= 5 ? xAxis - widgetWidth + 25 : 5
      let newY = yAxis - 25 >= 60 ? yAxis - 25 : 60
      const snapWidget = () => {
        that.props.snapWidget(that.props.widgetList['widgetConfig'], that.props.widgetKey, xAxis, yAxis)
      }
      document.onmouseup = null;
      document.onmousemove = null;
      that.props.moveWidget(that.props.stateRef, that.props.widgetKey, newX, newY, widgetState.state, snapWidget);

    }
  }

  showWidget(){
    if (this.props.stateRef === "menuWidget" && this.props.showMenu === 0){
      return "none"
    } else if (this.props.showStockWidgets === 0) {
      return "none"
    } else { 
      return "block"
    }
  }

  render() {
    const that = this;
    //Add widgets to the list below that should not have access to the stock search pane
    const hideStockSearchMenu = ["DashBoardMenu"]
  // console.log("drag state:", that.props.widgetList.column)
    const compStyle = {
      display: this.state.show
    };
    // zIndex: this.props.zIndex.indexOf(this.props.widgetKey),
    if (that.props.widgetList.column === 'drag'){ 
      // console.log("drag state:", that.props.widgetList.column)
      compStyle['position'] = 'absolute'
      compStyle['top'] = this.props.widgetList["yAxis"]
      compStyle['left'] = this.props.widgetList["xAxis"] 
    } 
    
    let widgetProps = that.props.widgetBodyProps();
    if (this.props.widgetKey !== "dashBoardMenu") {
      widgetProps["showEditPane"] = that.state.showEditPane;
      widgetProps["showPane"] = that.showPane;
      widgetProps['searchText'] = this.state.searchText
      widgetProps['changeSearchText'] = this.changeSearchText
    } 
    widgetProps.ref = this.widgetRef

    if (this.props.widgetCopy) {
      widgetProps['widgetCopy'] = this.props.widgetCopy
    }

    return (
      <div 
        key={this.props.widgetKey + "container" + that.props.widgetList.column} 
        id={this.props.widgetKey + "box"} 
        style={compStyle} 
        className="widgetBox"  
      >
        {this.props.widgetLockDown === 0 ? (
          <div className="widgetHeader">
            {this.state.showEditPane === 0 ? (
              <>
                {widgetProps['helpText'] !== undefined && <ToolTip textFragment={widgetProps['helpText']} hintName='wC1' />}
                {this.state.renderHeader}
              </>
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
                if (this.props.stateRef === "stockWidget") {
                  this.props.removeWidget("widgetList", this.props.widgetKey);
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
