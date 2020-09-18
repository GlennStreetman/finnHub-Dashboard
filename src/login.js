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
      <form className="loginForm" onSubmit={this.checkPassword}>
        <label htmlFor="loginText">
          <b>Username</b>
        </label>
        <input type="text" name="loginText" value={this.state.loginText} onChange={this.handleChange} />

        <label htmlFor="pwText">
          <b>Password</b>
        </label>
        <input type="text" name="pwText" value={this.state.pwText} onChange={this.handleChange} />

        <input className="btn" type="submit" value="Submit" />
      </form>
    );
  }
}

export default login;
