import React from "react";
  
class AccountMenu extends React.Component {
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
      serverMessage: "",
      rateLimit: 0,
      apiAlias: "", //used with graphQL Endpoint
    };

    this.baseState = {mounted: true}
    this.getAccountData = this.getAccountData.bind(this);
    this.changeAccountData = this.changeAccountData.bind(this);
    this.showEditPane = this.showEditPane.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.getAccountData(this.baseState);
  }

  componentWillUnmount(){
    this.baseState.mounted = false
  }

  handleChange(e) {
    this.setState({ inputText: e.target.value });
  }

  getAccountData(baseState) {
    fetch(`/accountData`)
    .then((response) => response.json())
    .then((data) => {
      if (baseState.mounted === true) {
        const dataSet = data["userData"];
        const rateLimit = dataSet.ratelimit !== null ? dataSet.ratelimit : 25
        this.setState({ 
          loginName: dataSet["loginname"],
          email: dataSet["email"],
          apiKey: dataSet["apikey"],
          webHook: dataSet["webhook"],
          rateLimit: rateLimit,
          apiAlias: dataSet["apialias"],
        })
        }
    })
    .catch((error) => {
      console.error("Failed to retrieve user data" + error);
    });
  }

  changeAccountData(changeField, newValue, baseState) {
    
    // console.log(changeField, newValue)
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
    }
    if (changeField === 'ratelimit') {
      this.props.throttle.updateInterval(newValue)
    }
    fetch("/accountData", options)
      .then((response) => response.json())
      .then((data) => {
        if (baseState.mounted === true) {
          this.getAccountData(baseState);
          this.setState({ 
            editToggle: 0,
            inputText: "",
            serverMessage: data.message,
          });
        }
      });
  }

  showEditPane(targetField) {
    this.setState({ editField: targetField });
    this.setState({ editToggle: 1 });
    this.setState({serverMessage: ""});
  }

  render() {
    const divOutline = {
      border: '5px solid',
      borderRadius: '10px',
      backgroundColor: 'white',
      padding: '5px',
      borderColor: '#1d69ab',
    }
    const messageStyle = {
      'textAlign': 'center',
    }
    return (
      <>
        {this.state.editToggle === 0 && (
          
          
          <div style={divOutline}>
            <b>Account Data:</b>
            <table>
              <tbody>
                <tr>
                  <td>Login:</td>
                  <td>{this.state.loginName}</td>
                  <td>
                    <button onClick={() => this.showEditPane("loginname")}>edit</button>
                  </td>
                </tr>
                <tr>
                  <td>Email:</td>
                  <td>{this.state.email}</td>
                  <td>
                    <button onClick={() => this.showEditPane("email")}>edit</button>
                  </td>
                </tr>
                <tr>
                  <td>apiKey:</td>
                  <td>{this.state.apiKey}</td>
                  <td>
                    <button onClick={() => this.showEditPane("apikey")}>edit</button>
                  </td>
                </tr>
                <tr>
                  <td>webHook Key:</td>
                  <td>{this.state.webHook}</td>
                  <td>
                    <button onClick={() => this.showEditPane("webhook")}>edit</button>
                  </td>
                </tr>
                <tr>
                  <td>Active Exchanges: </td>
                  <td>{this.props.exchangeList.toString()}</td>
                  <td>
                    <button onClick={() => this.props.toggleBackGroundMenu("exchangeMenu")}>edit</button>
                  </td>
                </tr>
                <tr>
                  <td>API Rate Limit: </td>
                  <td>{this.state.rateLimit}</td>
                  <td>
                    <button onClick={() => this.showEditPane("ratelimit")}>edit</button>
                  </td>
                </tr>
                <tr>
                  <td>API Alias: </td>
                  <td>{this.state.apiAlias}</td>
                  <td>
                    <button onClick={() => this.showEditPane("apialias")}>edit</button>
                  </td>
                </tr>
              </tbody>
            </table>
            {this.state.serverMessage !== "" && (
                <div style={messageStyle}><b >{this.state.serverMessage}</b></div>
            )}
          </div>
        )}
        {this.state.editToggle === 1 && (
          <table>
            <tbody>
              <tr>
                <td>{"Old apikey: " + this.props.apiKey + ":"}</td>
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
                  <button value="Submit" onClick={() => this.changeAccountData(this.state.editField, this.state.inputText, this.baseState)}>
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
    throttle: that.state.throttle,
    apiKey: that.state.apiKey,
    widgetKey: key,
    updateAPIKey: that.updateAPIKey,
    exchangeList: that.state.exchangeList,
    toggleBackGroundMenu: that.toggleBackGroundMenu,
  };
  return propList;
}

export default AccountMenu;
