import React from "react";
// import StockSearchPane from "../../stockSearchPane.js";

class AccountMenu extends React.PureComponent {
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
    this.getAccountData = this.getAccountData.bind(this);
    this.changeAccountData = this.changeAccountData.bind(this);
    this.showEditPane = this.showEditPane.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.getAccountData();
  }
 
  handleChange(e) {
    this.setState({ inputText: e.target.value });
  }

  getAccountData() {
    fetch(`/accountData`)
      .then((response) => response.json())
      .then((data) => {
        // console.log(data)
        let dataSet = data["userData"];
        this.setState({ loginName: dataSet["loginname"] });
        this.setState({ email: dataSet["email"] });
        this.setState({ apiKey: dataSet["apikey"] });
        this.setState({ webHook: dataSet["webhook"] });
      })
      .catch((error) => {
        console.error("Failed to retrieve user data" + error);
      });
  }

  changeAccountData(changeField, newValue) {
    
    console.log(changeField, newValue)
    const data = {
      field: changeField,
      newValue: newValue,
    };

    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };

    if (changeField === "apikey") {
      console.log('updating apikey')
      this.props.updateAPIKey(newValue)
    } else {console.log('not updating apikey', changeField)}
 
    fetch("/accountData", options)
      .then((data) => console.log(data))
      .then(() => {
        this.getAccountData();
        this.setState({ editToggle: 0 });
        this.setState({ inputText: "" });
      });
  }

  showEditPane(targetField) {
    this.setState({ editField: targetField });
    this.setState({ editToggle: 1 });
  }

  render() {
    return (
      <>
        {this.state.editToggle === 0 && (
          <table>
            <tbody>
              <tr>
                <td>Login</td>
                <td>{this.state.loginName}</td>
                <td>
                  <button onClick={() => this.showEditPane("loginname")}>edit</button>
                </td>
              </tr>
              <tr>
                <td>Email</td>
                <td>{this.state.email}</td>
                <td>
                  <button onClick={() => this.showEditPane("email")}>edit</button>
                </td>
              </tr>
              <tr>
                <td>apiKey</td>
                <td>{this.state.apiKey}</td>
                <td>
                  <button onClick={() => this.showEditPane("apikey")}>edit</button>
                </td>
              </tr>
              <tr>
                <td>webHook Key</td>
                <td>{this.state.webHook}</td>
                <td>
                  <button onClick={() => this.showEditPane("webhook")}>edit</button>
                </td>
              </tr>
            </tbody>
          </table>
        )}
        {this.state.editToggle === 1 && (
          <table>
            <tbody>
              <tr>
                <td>{"Old " + this.state.editField + ":"}</td>
                <td>{this.state[this.state.editField]}</td>
              </tr>
              <tr>
                <td>{"New " + this.state.editField + ":"}</td>
                <td>
                  <input type="text" value={this.state.inputText} onChange={this.handleChange}></input>
                </td>
              </tr>
              <tr>
                <td>
                  <button value="Submit" onClick={() => this.setState({ editToggle: 0 })}>
                    Cancel
                  </button>
                </td>
                <td>
                  <button value="Submit" onClick={() => this.changeAccountData(this.state.editField, this.state.inputText)}>
                    Submit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </>
    );
  }
}

export function accountMenuProps(that, key = "AccountMenu") {
  let propList = {
    apiKey: that.props.apiKey,
    // globalStockList: that.props.globalStockList,
    // getStockPrice: that.getStockPrice,
    // showPane: that.props.showPane,
    // trackedStockData: that.state.trackedStockData,
    // updateGlobalStockList: that.props.updateGlobalStockList,
    // updateWidgetStockList: that.props.updateWidgetStockList,
    widgetKey: key,
    updateAPIKey: that.props.updateAPIKey
  };
  return propList;
}

export default AccountMenu;
