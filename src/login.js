import React from "react";

class login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginText: "guest",
      pwText: "guest",
    };

    this.handleChange = this.handleChange.bind(this);
    this.checkPassword = this.checkPassword.bind(this);
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  checkPassword(e) {
    e.preventDefault();
    fetch("/login?loginText=" + this.state.loginText + "&pwText=" + this.state.pwText)
      .then((response) => response.json())
      .then((data) => {
        this.props.updateLogin(data["key"], data["login"]);
      })
      .catch((error) => {
        console.error("No server response", error);
      });
  }

  render() {
    return (
      <div className="login-splash">
        <div className="login-container">
          <div className="login-div">
            <img src="logo.png"></img>
          </div>
          <div className="login-div">
            {/* <form className="login-Form" onSubmit={this.checkPassword}> */}
            <div className="login-div">
              {/* <label htmlFor="loginText"> */}
              <b className="login-text">Username</b>
              {/* </label> */}
            </div>
            <div className="login-div">
              <input type="text" name="loginText" value={this.state.loginText} onChange={this.handleChange} />
            </div>
            <div className="login-div">
              <b className="login-text">Password</b>
            </div>
            <div className="login-div">
              <input type="text" name="pwText" value={this.state.pwText} onChange={this.handleChange} />
            </div>
            <div className="login-div">
              <input className="loginBtn" type="submit" value="Submit" onClick={this.checkPassword} />
            </div>
            {/* </form> */}
          </div>
          <div className="div-inline-login">
            <div className="login-div-options">
              <a href="#">
                <b>Forgot Login</b>
              </a>
            </div>
            <div className="login-div-options">
              <a href="#">
                <b>Register</b>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default login;
