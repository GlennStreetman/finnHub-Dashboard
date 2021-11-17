
export const CheckLoginStatus = async function(finnHubQueue){
    console.log('CHECKING LOGGIN STATUS')
    const response = await fetch("/checkLogin")
    const data = await response.json()
    if (data.login === 1) {
        finnHubQueue.updateInterval(data.ratelimit)
        return(data)
    } else {
        console.log('FAILED LOGIN', {login: 0})
    }
}
