/**
 * @jest-environment jsdom
 */

import 'whatwg-fetch';
import { mount } from 'enzyme';
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'

import App from '../App'
import { store } from '../store'

import { getLogin_succeed } from '../server/routes/loginRoutes/login.mock'
import { getCheckLogin_fail } from '../server/routes/loginRoutes/checkLogin.mock'
import { getRegister_success } from '../server/routes/accountRegistration/register.mock'
import { getDashboard_success_noWidgets } from '../server/routes/loggedIn/dashboard.mock'

import { checkPasswordMock } from '../appFunctions/client/checkPassword.mock'
import { registerAccountMock } from '../appFunctions/client/registerAccount.mock'
import { getSavedDashBoardsMock } from '../appFunctions/appImport/setupDashboard.mock';


const server = setupServer(getLogin_succeed, getCheckLogin_fail, getRegister_success, getDashboard_success_noWidgets)

beforeAll(() => { server.listen() })
// afterEach(() => { server.resetHandlers() })
afterAll(() => { server.close() })

it('component/Login Action:click Login: Check that login works. getSavedDashboards ', async (done) => {

    const wrapper = mount( //mount app
        <Provider store={store}>
            <App />
        </Provider>)

    expect(wrapper.find('App').length).toEqual(1)
    const appClass = wrapper.find('App').instance()
    appClass.getSavedDashBoards = getSavedDashBoardsMock
    const loginInstance = wrapper.find('login').instance()
    loginInstance.checkPassword = checkPasswordMock
    appClass.setState({})
    wrapper.update()

    const app = wrapper.find('App')
    //click login button
    expect(wrapper.find('.loginBtn').length).toEqual(1)
    wrapper.find('.loginBtn').simulate('click') //CLICK login

    expect(checkPasswordMock).toHaveBeenCalledTimes(1)
    await checkPasswordMock.mock.results[0].value //await fetch

    expect(getSavedDashBoardsMock).toHaveBeenCalledTimes(1)
    expect(app.state('login')).toEqual(1)
    expect(app.state('apiKey')).toEqual(0)
    expect(app.state('apiAlias')).toEqual('alias')
    expect(app.state('widgetSetup')).toEqual({ PriceSplits: false })
    done()
})

it('component/Login Action:click Register: Register button loads register screen, submit returns server message', async (done) => {

    const wrapper = mount( //mount app
        <Provider store={store}>
            <App />
        </Provider>)

    expect(wrapper.find('#loginLink2').length).toEqual(1)
    expect(wrapper.find('login').length).toEqual(1)
    const Login = wrapper.find('login').instance()
    Login.registerAccount = registerAccountMock
    const link2 = wrapper.find('#loginLink2')

    expect(Login.state.showMenu).toBe(0) //login menu
    link2.simulate('click') //CLICK link2 effect
    wrapper.find('login').setState({
        text0: 'testuser1',
        text1: 'testPassword1',
        text2: 'testPassword1',
        text3: 'testEmail@gmail.com',
        text4: 'secretQuestion',
        text5: 'SecretAnswers',
    })
    expect(Login.state.showMenu).toBe(2) //register menu
    wrapper.find('.loginBtn').simulate('click') //CLICK register
    expect(registerAccountMock).toHaveBeenCalledTimes(1)
    await registerAccountMock.mock.results[0].value

    expect(Login.state.message).toBe('Thank you for registering, please check your email and follow the confirmation link.')
    done()
})








