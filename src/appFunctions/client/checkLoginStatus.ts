import { finnHubQueue } from "src/appFunctions/appImport/throttleQueueAPI";

export const checkLoginStatus = function (processLogin: Function, updateExchangeList: Function, finnHubQueue: finnHubQueue, updateAppState: Function) {
    // console.log('CHECKING LOGGIN STATUS')
    fetch("/checkLogin")
        .then((response) => response.json())
        .then((data) => {
            if (data.login === 1) {
                processLogin(data.apiKey, 1, data.apiAlias, data.widgetsetup)
                updateExchangeList(data.exchangelist)
                updateAppState({ defaultExchange: data.defaultexchange })
                finnHubQueue.updateInterval(data.ratelimit)
            } else {
                // console.log('FAILED LOGIN', data)
            }
        })
}
