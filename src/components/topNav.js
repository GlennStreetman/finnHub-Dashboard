import React from "react";

class TopNav extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      AboutAPIKeyReminder: 0,
      showAddWidgetDropdown: 0
    };

    this.showPane = this.showPane.bind(this);
  }

  componentDidUpdate(prevProps) {
    const p = this.props
    
    if (p.apiFlag === 1 && p.apiFlag !== prevProps.apiFlag) {
      // show welcome menu if finnhub apiKey not setup.
      this.setState({AboutAPIKeyReminder: 1})
      this.props.menuWidgetToggle("AboutMenu", "Welcome to FinnDash")
    }
  }

  showPane(stateRef, fixState = 0) {
    //toggles view of specified menu. 1 = open 0 = closed
    let showMenu = this.state[stateRef] === 0 ? 1 : 0;
    fixState === 1 && (showMenu = 1);
    this.setState({ [stateRef]: showMenu });
  }

  render() {

    return this.props.login === 1 ? (
      <>
        <div className="topnav">
        <img src="logo2.png" alt="logo"></img>
          <div className="navItem">
            <a href="#contact" onClick={() => this.props.menuWidgetToggle("WatchListMenu", "WatchList")}>
              {this.props.WatchListMenu === 0 ? "Show Watchlist Menu" : "Hide Watchlist Menu"}
            </a>
          </div>

          <div className="navItem">
            <a href="#contact" onClick={() => this.props.menuWidgetToggle("DashBoardMenu", "Saved Dashboards")}>
              {/* <a href="#contact" onClick={() => this.showPane("showDashBoardMenu")}> */}
              {this.props.DashBoardMenu === 0 ? "Show Dashboard Menu" : "Hide Dashboard Menu"}
            </a>
          </div>
          <div className="navItem">
            <a href="#contact" onClick={() => (this.props.widgetLockDown === 0 ? this.props.lockWidgets(1) : this.props.lockWidgets(0))}>
              {this.props.widgetLockDown === 0 ? "Lock Widgets" : "Unlock Widgets"}
            </a>
          </div>
          <div className="navItem">
            <a href="#contact" onClick={() => this.props.menuWidgetToggle("AccountMenu", "Your Account")}>
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
            <a href="#home" onClick={() => this.props.menuWidgetToggle("AboutMenu", "About FinnDash")}>
            {this.props.AboutMenu === 0 ? "About" : "Hide About"}
            </a>
          </div>
          <div className='navItem'>
            <a href="#home" onClick={() => this.props.logOut()}>
            {this.props.login === 0 ? "Login" : "Logout"}
            </a>
          </div>

        </div>

      </>
    ) : (
      <>
      <div className="topnav">
        <div className='navItemEnd'>
          <a href="#home" onClick={() => this.props.menuWidgetToggle("AboutMenu", "About FinnDash")}>
          {this.props.AboutMenu === 0 ? "About" : "Hide About"}
          </a>
        </div>
      </div>
      </>
    ); 
  }
}

export default TopNav;
