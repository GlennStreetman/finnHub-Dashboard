import {completeLogin} from './completeLogin'

export const completeLoginMock = jest.fn((that, data)=>{
    return new Promise(async(res)=>{
    const val = await completeLogin(that, data)
    res(val)
})})
