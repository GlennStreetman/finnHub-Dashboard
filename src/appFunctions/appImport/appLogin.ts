import { AppState, widgetSetup } from './../../App'

export const Logout = function logOut() {
    fetch("/logOut")
        .then((data) => console.log('logging out', data))
        .then(() => {
            setTimeout(() => this.setState(this.baseState), 100)
        });
}

export const ProcessLogin = function processLogin(apiKey: string, setLogin: number, ratelimit: number, apiAlias: string, widgetSetup: string) {
    const parseSetup: widgetSetup = JSON.parse(widgetSetup)
    const payload: Partial<AppState> = {
        login: setLogin,
        apiKey: apiKey,
        apiAlias: apiAlias,
        // apiRateLimit: ratelimit,
        widgetSetup: parseSetup,
    }
    this.setState(payload);
}


