export const completeLogin = function(p, data, setMessage){
    if (data.login) {
        setMessage("")
        p.processLogin(data["key"], data["login"], data['apiAlias'], data['widgetsetup']);
        p.updateExchangeList(data.exchangelist)
        p.updateDefaultExchange(data.defaultexchange, data.apiKey)
        p.finnHubQueue.updateInterval( data['ratelimit'])
        return true
    } else {return false}
}