import React from "react";

class DashBoardMenu extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      inputText: "dashboard name",
      // dashBoardData: [],
    };
    this.handleChange = this.handleChange.bind(this);
    // this.getSavedDashBoards = this.getSavedDashBoards.bind(this);
    this.deleteDashBoard = this.deleteDashBoard.bind(this);
  }

  componentDidMount() {
    // console.log("mounted");
    this.props.getSavedDashBoards(); //might not be needed
  }

  handleChange(e) {
    this.setState({ inputText: e.target.value.toUpperCase() });
  }

  // getSavedDashBoards() {
  //   // console.log("running");
  //   fetch("/dashBoard")
  //     .then((response) => response.json())
  //     .then((data) => {
  //       console.log(data);
  //       this.setState({ dashBoardData: data["savedDashBoards"] }); // this.props.updateLogin(data["key"], data["login"]);
  //     })
  //     .catch((error) => {
  //       console.error("Failed to recover dashboards", error);
  //     });
  // }

  deleteDashBoard(dashBoardId) {
    fetch(`/deleteSavedDashboard?dashID=${dashBoardId}`)
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        this.props.getSavedDashBoards();
      })
      .catch((error) => {
        console.error("Failed to delete dashboard" + error);
      });
  }

  render() {
    let dashBoardData = this.props.dashBoardData;
    let savedDashBoards = Object.keys(dashBoardData).map((el) => (
      <tr key={dashBoardData[el].id + "tr"}>
        <td>
          <button onClick={() => this.deleteDashBoard(dashBoardData[el].id)}>
            {/* <button onClick={() => this.props.loadDashBoard(el.globalStockList, el.widgetList)}> */}
            <i className="fa fa-times" aria-hidden="true"></i>
          </button>
        </td>
        <td key={dashBoardData[el].id + "te"}>{dashBoardData[el].dashBoardName}</td>
        <td>
          <button onClick={() => this.props.loadDashBoard(dashBoardData[el].globalStockList, dashBoardData[el].widgetList)}>
            <i className="fa fa-check-square-o" aria-hidden="true"></i>
          </button>
        </td>
      </tr>
    ));

    return (
      <div className="dashBoardMenu">
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
              this.props.saveCurrentDashboard(e, this.state.inputText);
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
