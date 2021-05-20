import {registerAccount} from './registerAccount'

export const registerAccountMock = jest.fn((loginText, pwText, reEnter ,emailText, secretQuestion, secretAnswer, emailIsValid)=>{return new Promise(async(res)=>{
    const val = await registerAccount(loginText, pwText, reEnter ,emailText, secretQuestion, secretAnswer, emailIsValid)
    res(val)
})})
