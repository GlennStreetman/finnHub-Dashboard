import { ProcessLogin } from '../../appFunctions/appImport/appLogin'
import { UpdateExchangeList } from '../../appFunctions/appImport/updateExchangeList'
import { UpdateDefaultExchange } from '../../appFunctions/appImport/updateDefaultExchange'
import { finnHubQueue } from "../../appFunctions/appImport/throttleQueueAPI";

export const CompleteLogin = function (dispatch: Function, data, finnHubQueue: finnHubQueue, setAppState) {
    console.log('completing login', data)
    if (data.login) {
        ProcessLogin(dispatch, data["key"], data["login"], data['apiAlias'], data['widgetsetup'], setAppState);
        UpdateExchangeList(dispatch, data.exchangelist)
        UpdateDefaultExchange(dispatch, data.defaultexchange, data.apiKey, finnHubQueue)
        finnHubQueue.updateInterval(data['ratelimit'])
        return true
    } else {
        return false
    }
}