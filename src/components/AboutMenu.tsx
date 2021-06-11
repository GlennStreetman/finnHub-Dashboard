import React from "react";

interface aboutMenuProps2 {
  apiFlag: number,
}

class AboutMenu extends React.PureComponent<aboutMenuProps2> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const divOutline = {
      border: "5px solid",
      borderRadius: "10px",
      backgroundColor: "white",
      padding: "5px",
      borderColor: "#1d69ab",
    };

    return (
      <div style={divOutline}>
        <div className="bodyTxt">
          <p>
            <b>FinnDash:</b> An App, for your FinnHub.io API data, that allows you to specify data sets using a dashboard creator, adds a graphQL wrapper to each dashboard, and allows your to push your data into excel templates.
            <br />
            <br />
            <b>Getting Started: </b> <br />
            {this.props.apiFlag > 0 ? (
              <mark>
                1. Register for your free Finnhub.io API key:
                <a href="https://finnhub.io/register" target="_blank" rel="noopener noreferrer">
                  FinnHub Register
                </a>
                <br />
                2. After registering for your Finnhub API key, login, then click Manage Account and update your API Key info.
                <br />
              </mark>
            ) : (
              <>
                1. Register for your free Finnhub.io API key:{" "}
                <a href="https://finnhub.io/register" target="_blank" rel="noopener noreferrer">
                  FinnHub Register
                </a>
                <br />
                2. After registering for your Finnhub API key, login, then click Manage Account and update your API Key info.
                <br />
              </>
            )}
            3. Once your API key is saved click 'add widget' to begin designing a new widget dashboard.
            <br />
            4. After your dashboard is setup remember to click "Show Dashboard Menu" and save your new dashboard before exiting.
            <br />
            <b>Widget Setup: </b> <br />
            1. Click 'Show Watchlist Menu' to add/review the list of stocks that will default into your widgets. <br />
            2. Click <i className="fa fa-pencil-square-o" aria-hidden="true"></i> on any widget to toggle to the widgets configuration menu. Click again to
            return to the widgets data screen. <br />
            3. Click and hold <i className="fa fa-arrows" aria-hidden="true"></i> to reposition any widget. <br />
            4. Click 'Show Dashboard Menu' to review saved dashboards and save new ones. <br />
            5. After typing in a new dashboard name and hitting save you can click <i className="fa fa-check-square-o" aria-hidden="true"></i> to reload the
            dashboard.
            <br />
            <b>Source and Author: </b> <br />
            See{" "}
            <a href="https://github.com/GlennStreetman/finHub-Dashboard-react" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>{" "}
            to review code, request/submit new widgets, submit bugs, or request changes.
            <br />
            Created by Glenn Streetman. Contact: glennstreetman@gmail.com
            <br />
          </p>
        </div>
        {this.props.apiFlag > 0 ? <mark>Warning: Problem with API key.</mark> : <></>}
      </div>
    );
  }
}

export function aboutMenuProps(that, key = "AboutMenu") {
  let propList = {};
  return propList;
}

export default AboutMenu;
