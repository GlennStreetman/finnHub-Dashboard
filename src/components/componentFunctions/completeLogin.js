import {ProcessLogin}   from './../../appFunctions/appImport/appLogin'

export const CompleteLogin = function(p, data, setMessage){
    console.log('completing login')
    if (data.login) {
        setMessage("")
        ProcessLogin(data["key"], data["login"], data['apiAlias'], data['widgetsetup']);
        p.updateExchangeList(data.exchangelist)
        p.updateDefaultExchange(data.defaultexchange, data.apiKey)
        p.finnHubQueue.updateInterval( data['ratelimit'])
        return true
    } else {return false}
}