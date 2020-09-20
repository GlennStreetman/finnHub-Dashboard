import React from "react";

//compnent used when searching for a stock via "Add stock to watchlist" on top bar or any widget searches.
class DashBoardMenu extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      inputText: "dashboard name",
      dashBoardData: [],
    };
    this.handleChange = this.handleChange.bind(this);
    this.saveCurrentDashboard = this.saveCurrentDashboard.bind(this);
    this.getSavedDashBoards = this.getSavedDashBoards.bind(this);
  }

  componentDidMount() {
    // console.log("mounted");
    this.getSavedDashBoards();
  }

  componentDidUpdate() {}

  handleChange(e) {
    this.setState({ inputText: e.target.value.toUpperCase() });
  }

  getSavedDashBoards() {
    // console.log("running");
    fetch("/dashBoard")
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        this.setState({ dashBoardData: data }); // this.props.updateLogin(data["key"], data["login"]);
      })
      .catch((error) => {
        // console.error("Failed to recover dashboards", error);
      });
  }

  saveCurrentDashboard(e) {
    // console.log("logging data");
    // console.log(this.props.widgetList);
    const data = {
      dashBoardName: this.state.inputText,
      globalStockList: this.props.globalStockList,
      widgetList: this.props.widgetList,
    };
    // console.log(this.props.widgetList);
    // console.log(data.widgetList);
    console.log(data);
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(data),
    };
    console.log(options.body);

    // console.log(data);
    fetch("/dashBoard", options).then((data) => console.log(data));
    e.preventDefault();
  }

  render() {
    let dashBoardData = this.state.dashBoardData;
    let savedDashBoards = dashBoardData.map((el) => (
      <tr key={el.id + "tr"}>
        <td>
          <button>
            <i className="fa fa-times" aria-hidden="true"></i>
          </button>
        </td>
        <td key={el.id + "te"}>{el.dashBoardName}</td>
        <td>
          <button onClick={() => this.props.loadDashBoard(el.globalStockList, el.widgetList)}>
            <i className="fa fa-check-square-o" aria-hidden="true"></i>
          </button>
        </td>
      </tr>
    ));
    // console.log(savedDashBoards);

    return (
      <div className="dashBoardMenu">
        <div className="dashBoardHeader">DashBoard Menu</div>
        <div>
          {savedDashBoards.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <td>Remove</td>
                  <td>Description</td>
                  <td>Display</td>
                </tr>
              </thead>
              <tbody>{savedDashBoards}</tbody>
            </table>
          ) : (
            "No previous saves"
          )}
        </div>
        <div className="dashBoardFooter">
          <form
            className="form-inline"
            onSubmit={(e) => {
              this.saveCurrentDashboard(e);
            }}
          >
            <input type="text" value={this.state.inputText} onChange={this.handleChange}></input>
            <input className="btn" type="submit" value="Submit" />
          </form>
        </div>
      </div>
    );
  }
}
export default DashBoardMenu;
