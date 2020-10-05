import React from "react";

class login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginText: "guest",
      pwText: "guest",
      loginState: 0, //0 = login, 1 = recover, 2 = register, 3 = secret question, 4 reset password
      secretQuestion: "test",
      serverResponse: "",
    };

    this.handleChange = this.handleChange.bind(this);
    this.checkPassword = this.checkPassword.bind(this);
    this.forgotLogin = this.forgotLogin.bind(this);
    this.resetPW = this.resetPW.bind(this);
    this.newPW = this.newPW.bind(this);
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  checkPassword() {
    // console.log("logging in");
    // e.preventDefault();
    fetch("/login?loginText=" + this.state.loginText + "&pwText=" + this.state.pwText)
      .then((response) => response.json())
      .then((data) => {
        this.props.updateLogin(data["key"], data["login"]);
      })
      .catch((error) => {
        // console.error("No server response", error);
      });
  }

  forgotLogin() {
    // console.log("recover login request sent");
    fetch("/forgot?loginText=" + this.state.loginText)
      .then((response) => response.json())
      .then((data) => {
        if (data["user"] !== undefined) {
          this.setState({ serverResponse: "username: " + data["user"] });
          this.setState({ secretQuestion: data["question"] });
          this.setState({ loginState: 3 });
        } else {
          this.setState({ serverResponse: "Email not found" });
        }
      })
      .catch((error) => {
        console.error("No server response", error);
      });
  }

  resetPW() {
    //checks secret question then.
    console.log("reset password request sent");
    fetch("/secretQuestion?loginText=" + this.state.loginText)
      .then((response) => response.json())
      .then((data) => {
        // console.log("-----------");
        // console.log(data);
        if (data === "true") {
          this.setState({ serverResponse: "username: " + data["user"] });
          this.setState({ secretQuestion: data["question"] });
          this.setState({ loginState: 4 });
        } else {
          this.setState({ serverResponse: "Answer did not match." });
        }
      })
      .catch((error) => {
        console.error("No server response", error);
      });
  }

  newPW() {
    // console.log("--------");
    // console.log("setting new pw");
    if (this.state.loginText === this.state.pwText) {
      fetch("/newPW?newPassword=" + this.state.loginText)
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          if (data === "updated") {
            this.setState({ serverResponse: "Password Updated." });
            this.setState({ loginState: 0 });
          } else {
            this.setState({ serverResponse: "Answer did not match." });
          }
        })
        .catch((error) => {
          console.error("No server response", error);
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
      2: () => this.checkPassword(),
      3: () => this.resetPW(),
      4: () => this.newPW(),
    };
    let topTextLookup = {
      0: "Login to FinnDash",
      1: "Recover login name",
      2: "Register Finndash Account",
      3: "Reset Password?",
      4: "New Password",
    };

    let field1Lookup = {
      0: "UserName",
      1: "Email",
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
      0: () => this.setState({ loginState: 1 }),
      1: () => this.setState({ loginState: 0 }),
      2: () => this.setState({ loginState: 0 }),
      3: () => this.setState({ loginState: 0 }),
      4: () => this.setState({ loginState: 0 }),
    };
    let rightFunctionLookup = {
      0: () => this.setState({ loginState: 2 }),
      1: () => this.setState({ loginState: 2 }),
      2: () => this.setState({ loginState: 1 }),
      3: () => this.setState({ loginState: 2 }),
      4: () => this.setState({ loginState: 2 }),
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
        <div className="login-splash">
          <div className="login-container">
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
              {/* {this.state.loginState !== 1 ? ( */}
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
