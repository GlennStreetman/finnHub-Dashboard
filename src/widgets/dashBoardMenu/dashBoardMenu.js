import React from "react";

class DashBoardMenu extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      inputText: "enter name",
      checkMark: "faIcon",
      // dashBoardData: [],
    };
    this.handleChange = this.handleChange.bind(this);
    this.deleteDashBoard = this.deleteDashBoard.bind(this);
    this.showCheckMark = this.showCheckMark.bind(this);
  }

  componentDidMount() {
    // console.log("mounted");
    this.props.getSavedDashBoards();

  }

  componentDidUpdate(prevProps){
    if (this.props.currentDashBoard !== prevProps.currentDashBoard && this.props.currentDashBoard !== null) {
      this.setState({inputText: this.props.currentDashBoard})
    }
  }

  handleChange(e) {
    this.setState({ inputText: e.target.value.toUpperCase() });
  }

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

  showCheckMark() {
    this.setState({ checkMark: "faIconFade" });
    setTimeout(() => this.setState({ checkMark: "faIcon" }), 3000);
  }

  render() {
    let dashBoardData = this.props.dashBoardData;
    let savedDashBoards = Object.keys(dashBoardData).map((el) => (
      <tr key={dashBoardData[el].id + "tr"}>
        <td className="centerTE">
          <button onClick={() => this.deleteDashBoard(dashBoardData[el].id)}>
            {/* <button onClick={() => this.props.loadDashBoard(el.globalStockList, el.widgetList)}> */}
            <i className="fa fa-times" aria-hidden="true"></i>
          </button>
        </td>
        <td key={dashBoardData[el].id + "te"}>{dashBoardData[el].dashboardname}</td>
        <td className="centerTE">
          <button
            onClick={() => {
              this.props.loadDashBoard(dashBoardData[el].globalstocklist, dashBoardData[el].widgetlist);
              this.setState({ inputText: dashBoardData[el].dashboardname });
            }}
          >
            <i className="fa fa-check-square-o" aria-hidden="true"></i>
          </button>
        </td>
      </tr>
    ));

    return (
      <div className="dashBoardMenu">
        <div>
          <table>
            <thead>
              <tr>
                <td className="centerTE">Remove</td>
                <td className="centerTE">Description</td>
                <td className="centerTE">Display</td>
              </tr>
            </thead>
            <tbody>
              {savedDashBoards.length > 0 ? (
                <>{savedDashBoards}</>
              ) : (
                <tr>
                  <td></td>
                  <td>"No previous saves"</td>
                  <td></td>
                </tr>
              )}
              <tr>
                <td className="centerTE">
                  <p className={this.state.checkMark}>
                    <i className="fa fa-check-circle" aria-hidden="true"></i>
                  </p>
                </td>
                <td>
                  <input type="text" value={this.state.inputText} onChange={this.handleChange}></input>
                </td>
                <td>
                  <input
                    className="btn"
                    type="submit"
                    value={this.props.currentDashBoard === this.state.inputText ? "Update" : " Save "}
                    // value="submit"
                    onClick={() => {
                      this.props.saveCurrentDashboard(this.state.inputText);
                      this.showCheckMark();
                    }}
                  />
                </td>
              </tr>
              <tr><td></td><td></td><td>
              <input
                className="btn"
                type="submit"
                value="New"
                // value="submit"
                onClick={() => {
                  this.props.newDashBoard();      
                }}
              />                
              </td></tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export function dashBoardMenuProps(that, key = "DashBoardMenu") {
  let propList = {
    getSavedDashBoards: that.props.getSavedDashBoards,
    dashBoardData: that.props.dashBoardData,
    loadDashBoard: that.props.loadDashBoard,
    currentDashBoard: that.props.currentDashBoard,
    saveCurrentDashboard: that.props.saveCurrentDashboard,
    newDashBoard: that.props.newDashboard,
  };
  return propList;
}

export default DashBoardMenu;
