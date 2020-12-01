import React from "react";
import queryString from 'query-string';

import WidgetControl from "./widgetControl.js";
import Login from "./login.js";

//Import props function from each widget/menu here and add to returnBodyProps function below.
import { dashBoardMenuProps } from "./../widgets/dashBoardMenu/dashBoardMenu.js";
import { watchListMenuProps } from "./../widgets/watchListMenu/watchListMenu.js";
import { candleWidgetProps } from "./../widgets/candle/candleWidget.js";
import { newsWidgetProps } from "./../widgets/News/newsWidget.js";
import { stockDetailWidgetProps } from "./../widgets/stockDetails/stockDetailWidget.js";
import { accountMenuProps } from "./../widgets/AccountMenu/accountMenu.js";
import { aboutMenuProps } from "./../widgets/AboutMenu/AboutMenu.js";
import { metricsProps } from "./../widgets/Metrics/Metrics.js";

class TopNav extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // trackedStockData: {},
      widgetLockDown: 0, //1: Hide buttons, 0: Show buttons
      DashBoardMenu: 0, //1 = show, 0 = hide
      WatchListMenu: 0, //1 = show, 0 = hide
      AccountMenu: 0, //1 = show, 0 = hide
      loadStartingDashBoard: 0, //flag switches to 1 after attemping to load default dashboard.
      AboutMenu: 0, //1 = show, 0 = hide
      AboutAPIKeyReminder: 0
    };

    this.showPane = this.showPane.bind(this);
    this.menuWidgetToggle = this.menuWidgetToggle.bind(this);
    this.returnBodyProps = this.returnBodyProps.bind(this);
  }

  componentDidMount() {
    // console.log('topnav mounted')
    if (this.props.login === 1) {this.props.getSavedDashBoards()};
  }

  componentDidUpdate(prevProps) {
    const p = this.props
    const s = this.state
    //lift this up to app level?
    if (p.login === 1 && prevProps.login === 0) {
      p.getSavedDashBoards()
    };
    //lift this up to app level?

    if (s.loadStartingDashBoard === 0 && p.currentDashBoard !== "") {
      this.setState({ loadStartingDashBoard: 1 });
      try {
        let loadWidget = p.dashBoardData[p.currentDashBoard]["widgetlist"];
        let loadGlobal = p.dashBoardData[p.currentDashBoard]["globalstocklist"];
        // console.log(loadWidget, loadGlobal)
        p.loadDashBoard(loadGlobal, loadWidget);
        this.setState({ DashBoardMenu: 1 });
      } catch (err) {
        console.log("failed to load dashboards", err);
      }
    }
    
    if (p.apiFlag === 1 && p.apiFlag !== prevProps.apiFlag) {
      // console.log('show welcome menu')
      this.setState({AboutAPIKeyReminder: 1})
      this.menuWidgetToggle("AboutMenu", "Welcome to FinnDash")
    }
  }

  returnBodyProps(that, key, ref = "pass") {
    //text reference should match dropdown link.
    let widgetBodyProps = {
      WatchListMenu: () => watchListMenuProps(that, key),
      DashBoardMenu: () => dashBoardMenuProps(that, key),
      CandleWidget: () => candleWidgetProps(that, ref),
      NewsWidget: () => newsWidgetProps(that, ref),
      StockDetailWidget: () => stockDetailWidgetProps(that, ref),
      AccountMenu: () => accountMenuProps(that, ref),
      AboutMenu: () => aboutMenuProps(that, ref),
      MetricsWidget: () => metricsProps(that, ref),
    };
    let renderBodyProps = widgetBodyProps[key];
    // console.log(renderBodyProps);
    return renderBodyProps;
  }

  showPane(stateRef, fixState = 0) {
    //toggles view of specified menu. 1 = open 0 = closed
    let showMenu = this.state[stateRef] === 0 ? 1 : 0;
    fixState === 1 && (showMenu = 1);
    this.setState({ [stateRef]: showMenu });
  }

  menuWidgetToggle(menuName, dashName = "pass") {
    //Create dashboard menu if first time looking at, else toggle visability

    if (this.props.menuList[menuName] === undefined) {
      this.props.newMenuContainer(menuName, dashName, "menuWidget");
      this.setState({ [menuName]: 1 });
    } else {
      this.state[menuName] === 1 ? this.setState({ [menuName]: 0 }) : this.setState({ [menuName]: 1 });
    }
  }

  render() {
    let widgetState = this.props.widgetList;
    let menuState = this.props.menuList;
    let that = this;
    const quaryData = queryString.parse(window.location.search)

    let widgetRender = Object.keys(widgetState).map((el) => (
      <WidgetControl
        //Required for widget Control.
        key={el}
        moveWidget={this.props.moveWidget}
        removeWidget={this.props.removeWidget}
        stateRef="widgetList" //used by app.js to move and remove widgets.
        widgetBodyProps={this.returnBodyProps(that, widgetState[el]["widgetType"], el)}
        widgetKey={el}
        widgetList={widgetState[el]}
        widgetLockDown={this.state.widgetLockDown}
        changeWidgetName={this.props.changeWidgetName}
        zIndex={this.props.zIndex}
        updateZIndex={this.props.updateZIndex}
      />
    ));

    let menuRender = Object.keys(menuState).map((el) => (
      <WidgetControl
        key={el}
        menuWidgetToggle={this.menuWidgetToggle}
        moveWidget={this.props.moveWidget}
        removeWidget={this.props.removeWidget}
        stateRef="menuList" //used by app.js to move and remove widgets.
        showMenu={this.state[el]}
        widgetBodyProps={this.returnBodyProps(that, el)}
        widgetKey={el}
        widgetList={menuState[el]}
        widgetLockDown={this.state.widgetLockDown}
        changeWidgetName={this.props.changeWidgetName}
        zIndex={this.props.zIndex}
        updateZIndex={this.props.updateZIndex}
      />
    ));

    // console.log(this.props.login)
    return this.props.login === 1 ? (
      <>
        <div className="topnav">
        <img src="logo2.png" alt="logo"></img>
          <div className="navItem">
            <a href="#contact" onClick={() => this.menuWidgetToggle("WatchListMenu", "WatchList")}>
              {this.state.WatchListMenu === 0 ? "Show Watchlist Menu" : "Hide Watchlist Menu"}
            </a>
          </div>

          <div className="navItem">
            <a href="#contact" onClick={() => this.menuWidgetToggle("DashBoardMenu", "Saved Dashboards")}>
              {/* <a href="#contact" onClick={() => this.showPane("showDashBoardMenu")}> */}
              {this.state.DashBoardMenu === 0 ? "Show Dashboard Menu" : "Hide Dashboard Menu"}
            </a>
          </div>
          <div className="navItem">
            <a href="#contact" onClick={() => (this.state.widgetLockDown === 0 ? this.setState({ widgetLockDown: 1 }) : this.setState({ widgetLockDown: 0 }))}>
              {this.state.widgetLockDown === 0 ? "Lock Widgets" : "Unlock Widgets"}
            </a>
          </div>
          <div className="navItem">
            <a href="#contact" onClick={() => this.menuWidgetToggle("AccountMenu", "Your Account")}>
              Manage Account
            </a>
          </div>
          <div className="dropDiv" onMouseLeave={() => this.showPane("showAddWidgetDropdown")}>
            <a href="#test" className="dropbtn" onMouseOver={() => this.showPane("showAddWidgetDropdown")}>
              Add Widget
            </a>
            {this.state.showAddWidgetDropdown === 1 && (
              <div className="dropdown">
                <div className="dropdown-content">
                  <a
                    href="#1"
                    onClick={() => {
                      this.props.newWidgetContainer("StockDetailWidget", "Stock Values: ", "stockWidget");
                    }}
                  >
                    Day Stock Price
                  </a>
                  <a
                    href="#2"
                    onClick={() => {
                      this.props.newWidgetContainer("NewsWidget", "Recent News: ", "stockWidget");
                    }}
                  >
                    News Widget
                  </a>
                  <a
                    href="#3"
                    onClick={() => {
                      this.props.newWidgetContainer("CandleWidget", "Candle Data: ", "stockWidget");
                    }}
                  >
                    Stock Candles
                  </a>
                  <a
                    href="#3"
                    onClick={() => {
                      this.props.newWidgetContainer("MetricsWidget", "Stock Metrics: ", "stockWidget");
                    }}
                  >
                    Basic Metrics
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className='navItemEnd'>
            <a href="#home" onClick={() => this.menuWidgetToggle("AboutMenu", "About FinnDash")}>
            {this.state.AboutMenu === 0 ? "About" : "Hide About"}
            </a>
          </div>
          <div className='navItem'>
            <a href="#home" onClick={() => this.props.logOut()}>
            {this.props.login === 0 ? "Login" : "Logout"}
            </a>
          </div>

        </div>

        {widgetRender}
        {menuRender}
      </>
    ) : (
      <>
      <div className="topnav">
      <div className='navItemEnd'>
            <a href="#home" onClick={() => this.menuWidgetToggle("AboutMenu", "About FinnDash")}>
            {this.state.AboutMenu === 0 ? "About" : "Hide About"}
            </a>
          </div>
          <div className='navItem'>
            <a href="#home" onClick={() => this.props.logOut()}>
            {this.props.login === 0 ? "Login" : "Logout"}
            </a>
          </div>
      </div>
      <Login 
        updateLogin={this.props.processLogin}
        queryData = {quaryData}
      />
      {menuRender}
      </>
    ); 
  }
}

export default TopNav;
