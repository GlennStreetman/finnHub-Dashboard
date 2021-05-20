import { ProcessLogin , logoutServer } from './appLogin'

let mockLogin = function(apiKey, setLogin, apiAlias, widgetSetup){
    return new Promise(async (res) => {
        const val = await ProcessLogin( apiKey, setLogin, apiAlias, widgetSetup)
        res(val)
    })
}
export const processLoginMock = jest.fn(mockLogin)

let mockLogout = function(){
    console.log('mock logout success')
    return new Promise(async (res) => {
        const val = await logoutServer()
        res(val)
    })
}
export const logoutServerMock = jest.fn(mockLogout)
