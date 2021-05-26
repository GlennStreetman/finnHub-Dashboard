import {checkLoginStatus} from './checkLoginStatus'

export const checkLoginStatusMock = jest.fn((processLogin, updateExchangeList, updateDefaultExchange, finnHubQueue)=>{
    console.log('MOCK AUTO LOGIN')
    return new Promise(async(res)=>{
        const val = await checkLoginStatus(processLogin, updateExchangeList, updateDefaultExchange, finnHubQueue)
        res(val)
    })
})