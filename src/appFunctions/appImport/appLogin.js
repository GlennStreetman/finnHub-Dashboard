export const Logout = function logOut(){
    fetch("/logOut")
    .then((data) => console.log('logging out', data))
    .then(() => {
        setTimeout(() => this.setState(this.baseState),100)
    });
}

export const ProcessLogin = function processLogin(setKey, setLogin, ratelimit, apiAlias) {
    console.log('processing login', setKey, setLogin, ratelimit, apiAlias)
    this.setState({ 
        login: setLogin, 
        apiKey: setKey,
        apiAlias: apiAlias,
        apiRateLimit: ratelimit,
    });
}


