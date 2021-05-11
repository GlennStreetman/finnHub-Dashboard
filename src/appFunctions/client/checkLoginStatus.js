export const checkLoginStatus = function checkLoginStatus(processLogin, updateExchangeList, updateDefaultExchange, throttle){
    fetch("/checkLogin")
    .then((response) => response.json())
    .then((data) => {
        if (data.login === 1) {
            console.log("check login")
            processLogin(data.apiKey, 1, data.ratelimit, data.apiAlias, data.widgetsetup)
            updateExchangeList(data.exchangelist)
            updateDefaultExchange(data.defaultexchange)
            throttle.updateInterval(data.ratelimit)
        }
    })
}
