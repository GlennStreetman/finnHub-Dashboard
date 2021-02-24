export const checkLoginStatus = function checkLoginStatus(updateLogin, updateExchangeList, updateDefaultExchange, throttle){
    fetch("/checkLogin")
    .then((response) => response.json())
    .then((data) => {
    // console.log("Loggin status: ", data)
    if (data.login === 1) {
        updateLogin(data.apiKey, 1, data.ratelimit)
        updateExchangeList(data.exchangelist)
        updateDefaultExchange(data.defaultexchange)
        if (data.ratelimit > 0) {throttle.updateInterval(data.ratelimit)}
    } else {
        console.log("Not logged in:", data)
    }
    })
}