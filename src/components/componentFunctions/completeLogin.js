export const completeLogin = function(that, data){
    const p = that.props
    if (data.login) {
        that.setState({message: ""})
        p.processLogin(data["key"], data["login"], data['apiAlias'], data['widgetsetup']);
        p.updateExchangeList(data.exchangelist)
        p.updateDefaultExchange(data.defaultexchange)
        p.finnHubQueue.updateInterval( data['ratelimit'])
        return true
    } else {return false}
}