import React from "react";

class login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginText: "",
      pwText: "",
      emailText: "",
      loginState: 0, //0 = login, 1 = recover, 2 = register, 3 = secret question, 4 reset password
      secretQuestion: "",
      secretAnswer: "",
      serverResponse: "",
      userName: "",
    };

    this.handleChange = this.handleChange.bind(this);
    this.checkPassword = this.checkPassword.bind(this);
    this.forgotLogin = this.forgotLogin.bind(this);
    this.secretQuestion = this.secretQuestion.bind(this);
    this.newPW = this.newPW.bind(this);
    this.clearText = this.clearText.bind(this);
    this.registerAccount = this.registerAccount.bind(this);
    this.handleEnterKeyPress = this.handleEnterKeyPress.bind(this)
    this.checkLoginStatus = this.checkLoginStatus.bind(this)
  }

  componentDidMount(){
    console.log("Loading loggin screen.")
    // console.log(this.props.queryData)
    if (this.props.queryData.reset === '1') {
      const user = this.props.queryData.users
      // console.log(user)
      fetch(`/findSecret?user=${user}`)
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          this.setState({loginState: 3})
          this.setState({secretQuestion: data.question})
          this.setState({userName: data.user})
        } else {
          console.log("No response from server")
        }
      })
      .catch((error) => {
        console.error("No server response", error);
      });
    }
    
    this.checkLoginStatus()
  }

  checkLoginStatus(){
    fetch("/checkLogin")
    .then((response) => response.json())
    .then((data) => {
      // console.log("Loggin status: ", data)
      if (data.login === 1) {
        this.props.updateLogin(data.apiKey, 1)
        this.props.updateExchangeList(data.exchangelist)
        this.props.updateDefaultExchange(data.defaultexchange)
      } else {
        console.log("Not logged in:", data)
      }
    })
  }
  
  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  clearText(loginStateRef) {
    this.setState({ loginText: "" });
    this.setState({ pwText: "" });
    this.setState({ serverResponse: "" });
    this.setState({ emailText: "" });
    this.setState({ secretQuestion: "" });
    this.setState({ secretAnswer: "" });
    this.setState({ loginState: loginStateRef });
  }

  handleEnterKeyPress(e, keyFunction) {
    if (e.key === "Enter") {
      // console.log('enter detected')
      keyFunction()
    }
  }

  registerAccount() {
    const data = {
      loginText: this.state.loginText,
      pwText: this.state.pwText,
      emailText: this.state.emailText,
      secretQuestion: this.state.secretQuestion,
      secretAnswer: this.state.secretAnswer,
    };

    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };

    fetch("/register", options)
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        if (data === "true") {
          // console.log("its true");
          this.clearText(0);
          this.setState({ serverResponse: "Thank you for registering, please check your email and follow the confirmation link." });
        } else {
          this.setState({ serverResponse: data });
        }
      })
      .catch((error) => {
        // console.error("No server response", error);
      });
  }
 
  checkPassword() {

    fetch("/login?loginText=" + this.state.loginText + "&pwText=" + this.state.pwText)
      .then((response) => response.json())
      .then((data) => {
        console.log("login data: ",data.exchangelist, data.defaultexchange)
        if (data.response === 'success') {
          this.props.updateLogin(data["key"], data["login"]);
          this.props.updateExchangeList(data.exchangelist)
          this.props.updateDefaultExchange(data.defaultexchange)
        } else {
          this.setState({ serverResponse: data.response});
        }
      })
      .catch((error) => {
        console.error("No server response", error);
      });
  }

  forgotLogin() {
    // console.log("recover login request sent");
    fetch("/forgot?loginText=" + this.state.loginText)
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          this.setState({ serverResponse: data });
        }
      })
      .catch((error) => {
        console.error("No server response", error);
      });
  }

  secretQuestion() {
    //checks secret question before allowing pw reset.
    console.log("reset password request sent");
    fetch("/secretQuestion?loginText=" + this.state.loginText + "&user=" + this.state.userName)
      .then((response) => response.json())
      .then((data) => {
        if (data === "true") {
          this.setState({ serverResponse: "username: " + data["users"] });
          this.setState({ secretQuestion: data["question"] });
          this.clearText(4);
        } else {
          this.setState({ serverResponse: "Wrong answer, try again." });
        }
      })
      .catch((error) => {
        // console.error("No server response", error);
      });
  }

  newPW() {
    if (this.state.loginText === this.state.pwText) {
      fetch("/newPW?newPassword=" + this.state.loginText)
        .then((response) => response.json())
        .then((data) => {
          if (data === "true") {
            this.clearText(0);
            this.setState({ serverResponse: "Password Updated." });
          } else {
            this.setState({ serverResponse: "Passwords did not match." });
          }
        })
        .catch((error) => {
          // console.error("No server response", error);
        });
    } else {
      this.setState({ serverResponse: "Passwords do not match." });
    }
  }

  render() {
    //0 = login, 1 = recover, 2 = register
    let submitFunctionLookup = {
      0: () => this.checkPassword(),
      1: () => this.forgotLogin(),
      2: () => this.registerAccount(),
      3: () => this.secretQuestion(),
      4: () => this.newPW(),
    };
    let topTextLookup = {
      0: "Login to FinnDash",
      1: "Recover login name",
      2: "Register Finndash Account",
      3: "Answer Secret Question:",
      4: "New Password",
    };

    let field1Lookup = {
      0: "UserName",
      1: "Enter Email",
      2: "UserName",
      3: this.state.secretQuestion,
      4: "Enter New Password",
    };

    let field2Lookup = {
      0: "Password",
      1: "Hidden",
      2: "Password",
      3: "Hidden",
      4: "Re-Enter Password",
    };

    let leftTextLookup = {
      0: "Forgot Login",
      1: "Back",
      2: "Back",
      3: "Back",
      4: "Back",
    };
    let rightTextLookup = {
      0: "Register",
      1: "Register",
      2: "Forgot Login",
      3: "Register",
      4: "Register",
    };
    let leftFunctionLookup = {
      0: () => this.clearText(1),
      1: () => this.clearText(0),
      2: () => this.clearText(0),
      3: () => this.clearText(0),
      4: () => this.clearText(0),
    };
    let rightFunctionLookup = {
      0: () => this.clearText(2),
      1: () => this.clearText(2),
      2: () => this.clearText(1),
      3: () => this.clearText(2),
      4: () => this.clearText(2),
    };

    let field1 = field1Lookup[this.state.loginState];
    let field2 = field2Lookup[this.state.loginState];
    let topText = topTextLookup[this.state.loginState];
    let submitFunction = submitFunctionLookup[this.state.loginState];
    let leftText = leftTextLookup[this.state.loginState];
    let rightText = rightTextLookup[this.state.loginState];
    let leftFunction = leftFunctionLookup[this.state.loginState];
    let rightFunction = rightFunctionLookup[this.state.loginState];

    return (
      <>
        <div className="login-splash" onKeyDown = { (e) => this.handleEnterKeyPress(e, submitFunction)}>
          <div className="login-container" >
            <div className="login-div">
              <img src="logo.png" alt="logo"></img>
            </div>
            <div className="login-div">
              <div className="login-div">
                <b className="login-text">{topText}</b>
              </div>
              {/* top text field */}
              <div className="login-div">
                <b className="login-text">{field1}</b>
              </div>
              <div className="login-div">
                <input type="text" name="loginText" value={this.state.loginText} onChange={this.handleChange} />
              </div>
              {/* bottom text field. Show for login or register */}
              {[0, 2, 4].indexOf(this.state.loginState) > -1 ? (
                <>
                  <div className="login-div">
                    <b className="login-text">{field2}</b>
                  </div>
                  <div className="login-div">
                    <input type="password" name="pwText" value={this.state.pwText} onChange={this.handleChange} />
                  </div>
                </>
              ) : (
                <></>
              )}
              {/* 3rd text field used when registering */}
              {/* eamil */}
              {[2].indexOf(this.state.loginState) > -1 ? (
                <>
                  <div className="login-div">
                    <b className="login-text">Email</b>
                  </div>
                  <div className="login-div">
                    <input name="emailText" value={this.state.emailText} onChange={this.handleChange} />
                  </div>
                </>
              ) : (
                <></>
              )}
              {/* secret question */}
              {[2].indexOf(this.state.loginState) > -1 ? (
                <>
                  <div className="login-div">
                    <b className="login-text">Secret Question</b>
                  </div>
                  <div className="login-div">
                    <input name="secretQuestion" value={this.state.secretQuestion} onChange={this.handleChange} />
                  </div>
                </>
              ) : (
                <></>
              )}
              {/* secret answer */}
              {[2].indexOf(this.state.loginState) > -1 ? (
                <>
                  <div className="login-div">
                    <b className="login-text">Secret Answer</b>
                  </div>
                  <div className="login-div">
                    <input name="secretAnswer" value={this.state.secretAnswer} onChange={this.handleChange} />
                  </div>
                </>
              ) : (
                <></>
              )}
              {/* submit button */}
              <div className="login-div">
                <input className="loginBtn" type="submit" value="Submit" onClick={submitFunction} />
              </div>
            </div>
            {/* switch between login/register/forgot bellow */}
            <div className="div-inline-login">
              <div className="login-div-options">
                <a href="#login" onClick={leftFunction}>
                  <b>{leftText}</b>
                </a>
              </div>
              <div className="login-div-options">
                <a href="#login" onClick={rightFunction}>
                  <b>{rightText}</b>
                </a>
              </div>
            </div>
            {/* response from server */}
            <div>
              {this.state.serverResponse !== "" ? (
                <>
                  <b>{this.state.serverResponse}</b>
                </>
              ) : (
                <></>
              )}
            </div>

            {/* login container ends here */}
          </div>
        </div>
      </>
    );
  }
}

export default login;
