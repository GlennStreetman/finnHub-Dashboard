import { widgetSetup, setApp } from './../../App'
import { rSetApiAlias } from './../../slices/sliceApiAlias'
import { rSetApiKey } from './../../slices/sliceAPiKey'
import { rSetDashboardData } from './../../slices/sliceDashboardData'
import { rDataModelLogout } from "./../../slices/sliceDataModel";
import { rExchangeDataLogout } from "./../../slices/sliceExchangeData";
import { rExchangeListLogout } from "./../../slices/sliceExchangeList";
import { rTargetDashboardLogout } from "./../../slices/sliceShowData";



export const logoutServer = async function () {
    await fetch("/logOut") //ignore result, continue logout process.
    return true
}

export const Logout = function (dispatch: Function, setAppState: setApp) {
    dispatch(rDataModelLogout())
    dispatch(rExchangeDataLogout())
    dispatch(rExchangeListLogout())
    dispatch(rTargetDashboardLogout())
    setAppState.setLogin(0)
    return true
}

export const ProcessLogin = function (dispatch: Function, apiKey: string, setLogin: number, apiAlias: string, widgetSetup: string, setAppState: setApp) {
    const parseSetup: widgetSetup = JSON.parse(widgetSetup)
    setAppState.setLogin(setLogin)
    dispatch(rSetDashboardData(parseSetup))
    dispatch(rSetApiAlias(apiAlias))
    dispatch(rSetApiKey(apiKey))
}


