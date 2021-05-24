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
import { getDashboard_success_noWidgets } from '../server/routes/loggedIn/dashboard.mock'
import { getFinnDashData_noData } from '../server/routes/mongoDB/finnHubData.Mock'
import { getNoMock } from '../server/server.mock'

import { logoutServerMock } from './../appFunctions/appImport/appLogin.mock'
import { getSavedDashBoardsMock } from '../appFunctions/appImport/setupDashboard.mock';

const server = setupServer(getLogin_succeed, getCheckLogin_fail, getDashboard_success_noWidgets, getFinnDashData_noData, getNoMock)

beforeAll(() => { server.listen() })
afterAll(() => { server.close() })

it('component/topNav Action:click Logout: Check that logout sets Appstate to basestate and resets redux store. ', async (done) => {

    const wrapper = mount( //mount app
        <Provider store={store}>
            <App />
        </Provider>)

    expect(wrapper.find('App').length).toEqual(1)

    const appClass = wrapper.find('App').instance()
    appClass.getSavedDashBoards = getSavedDashBoardsMock
    appClass.logoutServer = logoutServerMock
    wrapper.update()
    appClass.setState({
        login: 1,
        apiKey: 'testKey',
        apiAlias: 'alias',
        widgetSetup: { PriceSplits: false }
    })

    const app = wrapper.find('App')
    expect(app.state('login')).toEqual(1)
    expect(app.state('apiKey')).toEqual('testKey')
    expect(app.state('apiAlias')).toEqual('alias')
    expect(app.state('widgetSetup')).toEqual({ PriceSplits: false })
    wrapper.update()

    expect(getSavedDashBoardsMock).toHaveBeenCalledTimes(1)
    await getSavedDashBoardsMock.mock.results[0].value

    expect(wrapper.find('#LogButtonLink').length).toEqual(1)
    wrapper.find('#LogButtonLink').simulate('click') //CLICK
    await logoutServerMock.mock.results[0].value //await fetch
    expect(app.state('login')).toEqual(0)
    expect(app.state('apiKey')).toEqual('')
    expect(app.state('apiAlias')).toEqual('')
    expect(app.state('widgetSetup')).toEqual({})
    done()
})