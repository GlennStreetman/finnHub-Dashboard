export const checkLoginStatus = function(processLogin, updateExchangeList, updateDefaultExchange, finnHubQueue){
    // console.log('CHECKING LOGGIN STATUS')
    fetch("/checkLogin")
    .then((response) => response.json())
    .then((data) => {
        if (data.login === 1) {
            processLogin(data.apiKey, 1, data.apiAlias, data.widgetsetup)
            updateExchangeList(data.exchangelist)
            updateDefaultExchange(data.defaultexchange, data.apiKey)
            finnHubQueue.updateInterval(data.ratelimit)
        } else {
            // console.log('FAILED LOGIN', data)
        }
    })
}
