import {checkPassword} from './checkPassword'

export const checkPasswordMock = jest.fn((loginText, pwText)=>{return new Promise(async(res)=>{
    const val = await checkPassword('loginText', 'pwText')
    res(val)
})})
