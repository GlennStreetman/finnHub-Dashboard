import React from "react";

interface aboutMenuProps2 {
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
                    <b>What is FinnDash:</b> An easy to use Web interface for your FinnHub.io API data.<br />
                    <b>What does finnDash Do?</b><br />
                    <table width='100%'>
                        <thead />
                        <tbody>
                            <tr><td>Rapidly design dashboards for your data, no need for any coding or command line.</td></tr>
                            <tr>
                                <td><iframe
                                    title='iFrameDb'
                                    src="https://giphy.com/embed/Y5UscA4cFsO38eCH5x"
                                    width="720"
                                    height="405"
                                    frameBorder="0"
                                    className="giphy-embed"
                                    style={{ pointerEvents: 'none' }} /></td>
                            </tr>
                            <tr><td>Review your data in excel with a single click.</td></tr>
                            <tr>
                                <td><iframe
                                    title='iFrameExcel'
                                    src="https://giphy.com/embed/L09jTt1uXWKuI5uIwq"
                                    width="720"
                                    height="405"
                                    frameBorder="0"
                                    className="giphy-embed"
                                    style={{ pointerEvents: 'none' }} /></td>
                            </tr>
                            <tr><td>Explore and share your Dashboard datasets using a GraphQL interface.</td></tr>
                            <tr>
                                <td><iframe
                                    title='iFrameGraphQL'
                                    src="https://giphy.com/embed/O0czKGv5B8zP1to1DK"
                                    width="720"
                                    height="405"
                                    frameBorder="0"
                                    className="giphy-embed"
                                    allowFullScreen
                                    style={{ pointerEvents: 'none' }} /></td>
                            </tr>
                            <tr><td>Build Complex excel templates that are filled with your dashboard data.</td></tr>
                            <tr>
                                <td><iframe
                                    title='iFrameTemplate'
                                    src="https://giphy.com/embed/4kl7W11ntfC0qUoSWN"
                                    width="720"
                                    height="405"
                                    frameBorder="0"
                                    className="giphy-embed"
                                    allowFullScreen
                                    style={{ pointerEvents: 'none' }} /></td>
                            </tr>

                        </tbody>
                    </table>

                    <b>Getting Started:</b> <br />

                    <>
                        1. Register for your free Finnhub.io API key:{" "}
                        <a href="https://finnhub.io/register" target="_blank" rel="noopener noreferrer">
                            FinnHub Register
                        </a>
                        <br />
                        2. After registering for your Finnhub API key, login, then click Manage Account and update your API Key info.
                        <br />
                    </>

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
                </div >
            </div >
        );
    }
}

export function aboutMenuProps(that, key = "AboutMenu") {
    let propList = {};
    return propList;
}

export default AboutMenu;
