import React from "react";

class AboutMenu extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loginName: "",
      email: "",
      apiKey: "",
      webHook: "",
      editToggle: 0,
      editField: "",
      inputText: "",
 
    };
  }

  render() {
      
    return (
      <div className="txt">
        <p>
        <b>FinnDash:</b> An App that allows you to visualize your FinnHub.IO API data by arranging and configuring financial widgets.<br /><br />
        <b>Getting Started: </b> <br />
        1. Register for your free Finnhub.io API key --> <a href='https://finnhub.io/register' target="_blank" rel="noopener noreferrer">FinnHub Register</a><br />
        2. After registering for your Finnhub API key click Manage Account and update your API Key info.<br />
        3. Once your API key is saved click 'add widget' to begin designing a new widget dashboard.<br />
        4. After your dashboard is setup remember to click "Show Dashboard Menu" and save your new dashboard before exiting.<br />
        <b>Source and Author: </b> <br />
        See <a href='https://github.com/GlennStreetman/finHub-Dashboard-react' target="_blank" rel="noopener noreferrer">GitHub</a> to review code, request/submit new widgets, submit bugs, or request changes.<br />
        Created by Glenn Streetman. Contact: glennstreetman@gmail.com<br />
        </p>
      </div>
    );
  }
}

export function aboutMenuProps(that, key = "AboutMenu") {
  let propList = {
    apiKey: that.props.apiKey,
    globalStockList: that.props.globalStockList,
    getStockPrice: that.getStockPrice,
    showPane: that.props.showPane,
    trackedStockData: that.state.trackedStockData,
    updateGlobalStockList: that.props.updateGlobalStockList,
    updateWidgetStockList: that.props.updateWidgetStockList,
    widgetKey: key,
  };
  return propList;
}

export default AboutMenu;
