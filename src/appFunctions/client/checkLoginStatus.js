export const checkLoginStatus = function checkLoginStatus(processLogin, updateExchangeList, updateDefaultExchange){
    fetch("/checkLogin")
    .then((response) => response.json())
    .then((data) => {
        if (data.login === 1) {
            // console.log("check login", data.apiKey, 1, data.ratelimit, data.apiAlias, data.widgetsetup)
            processLogin(data.apiKey, 1, data.ratelimit, data.apiAlias, data.widgetsetup)
            updateExchangeList(data.exchangelist)
            updateDefaultExchange(data.defaultexchange)
        }
    })
}
