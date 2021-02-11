export const Logout = function logOut(){
    fetch("/logOut")
    .then((data) => console.log('logging out', data))
    .then(() => {
      setTimeout(() => this.setState(this.baseState),100)
    });
  }

export const ProcessLogin = function processLogin(setKey, setLogin, ratelimit) {
    this.setState({ 
      login: setLogin, 
      apiKey: setKey,
      apiRateLimit: ratelimit
    });
  }


