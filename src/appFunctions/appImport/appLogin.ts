import { AppState, widgetSetup, AppProps } from './../../App'

export const logoutServer = async function () {
    await fetch("/logOut") //ignore result, continue logout process.
    return true
}

export const Logout = function () {
    const p: AppProps = this.props
    p.rDataModelLogout();
    p.rExchangeDataLogout();
    p.rExchangeListLogout();
    p.rTargetDashboardLogout();
    this.setState(this.baseState)
    return true
}

export const ProcessLogin = function (apiKey: string, setLogin: number, apiAlias: string, widgetSetup: string) {
    const p: AppProps = this.props
    const parseSetup: widgetSetup = JSON.parse(widgetSetup)
    const payload: Partial<AppState> = {
        login: setLogin,
        widgetSetup: parseSetup,
    }
    p.rSetApiAlias(apiAlias)
    p.rSetApiKey(apiKey)
    this.setState(payload, () => { return true });
}


