import { AppState, widgetSetup, AppProps } from './../../App'

export const Logout = function logOut() {
    const p: AppProps = this.props
    fetch("/logOut")
        .then((res) => res.json())
        .then((data) => {
            console.log(data.message)
            p.rDataModelLogout();
            p.rExchangeDataLogout();
            p.rExchangeListLogout();
            p.rTargetDashboardLogout();
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


