/**
 * @jest-environment jsdom
 */

import 'whatwg-fetch';
import React from "react";
import '@testing-library/jest-dom/extend-expect'
import { screen, render,  waitFor, fireEvent, prettyDOM} from '@testing-library/react' //prettyDOM
        // let renameList = screen.getByTestId(body)
        // console.log(prettyDOM(renameList))
import { configure } from '@testing-library/react'

import { setupServer } from 'msw/node'

//components
import App from '../../../App'
import { store } from '../../../store'
import { Provider } from 'react-redux'

//mock routes
import {mockFinnHubData, getDashboard_success, mockExchangeData, mockFinnHubData_toggle, } from './marketNews.mock' //if premium route add checkLogin override to .mock.ts file.
import { getCheckLogin_success } from '../../../server/routes/loginRoutes/checkLogin.mock' // <--override on line above IF premium route
import { getFinnDashData_noData, postFinnDashData_noSave }  from '../../../server/routes/mongoDB/finnHubData.mock'
import { postDashboard_success_noWidgets } from '../../../server/routes/loggedIn/dashboard.mock'
import { mockFinnHubDataQuote } from '../../../appFunctions/getStockPrices.mock'
import { mockFinnhubDataStockSymbol } from '../../../slices/sliceExchangeData.mock'
import { logUiErrorIntercept } from '../../../server/routes/logUiError.mock'
import { updateGLConfig_success } from '../../../server/routes/mongoDB/setMongoConfig.mock'
import { findMongoData_empty } from '../../../server/routes/mongoDB/findMongoData.mock'
import { deleteFinnDashData_success } from '../../../server/routes/mongoDB/deleteMongoRecords.mock'

//test Actions
import { addWidget } from '../../testFunctions/action_addWidget'
import { setSecurityFocus } from '../../testFunctions/action_selectFocus'
import { clickPagination } from '../../testFunctions/action_clickPagination'
import { toggleEditPane } from '../../testFunctions/action_toggleEditPane'
import { newWidgetName } from '../../testFunctions/action_newWidgetName'
import { addSecurity } from '../../testFunctions/action_addSecurity'
import { changeFilter } from '../../testFunctions/action_ChangeFilter'

//test procedures
import {testBodyRender} from '../../testFunctions/test_bodyRender'

//mock service worker for all http requests
const mockHTTPServer = setupServer(
    mockExchangeData, //exchange data for TSLA and AAPL
    getCheckLogin_success,  //auto login, mock user data
    getDashboard_success, //default dashboard setup
    mockFinnHubData, //mock finnhub earnings endpoint 
    getFinnDashData_noData, //mock mongo cached data empty.
    postFinnDashData_noSave, //mock post finndashdata save. 
    postDashboard_success_noWidgets,  //mock save dashboard after loading widget.
    mockFinnHubDataQuote, //mock finnhub quote data for wathclist menu widget.
    mockFinnhubDataStockSymbol, //mock stock data for exchange
    logUiErrorIntercept, //mock and warn about any user interface errors. SHould this force fail?
    updateGLConfig_success, //mock update success.
    findMongoData_empty, //no data found in mongo
    deleteFinnDashData_success, //delete success
    ) 

configure({
    getElementError: (message, container) => {
        // let renameList = screen.getByTestId(body)
        const error = new Error(message); //prettyDOM(renameList,
        error.name = 'TestingLibraryElementError';
        error.stack = null;
        return error;
    },
});

const widgetType = 'FundamentalsMarketNews'
const body = 'marketNewsBody'

beforeAll(() => {mockHTTPServer.listen({
    onUnhandledRequest: 'warn',
})})
afterAll(() => { mockHTTPServer.close() })

beforeEach( async ()=>{
    const {debug} = render( 
        <Provider store={store}>
            <App />
        </Provider>
    )
    await waitFor(() => {
        expect(screen.getByTestId('dashboardMenu')).toBeInTheDocument()
    })
    await addWidget('estimatesDropdown', 'Fundamentals', 'Market News') //mount widget to be tested.
})

afterEach( async ()=>{
    //unmount widget 
    expect(screen.getByTestId(`removeWidget-${widgetType}`)).toBeInTheDocument() 
    fireEvent.click(screen.getByTestId(`removeWidget-${widgetType}`))
    await waitFor(async () => {
        await expect(screen.queryByTestId(body)).toBe(null)
    })
})

it(`Test ${widgetType} Widget: Change pagination.`, async (done) => { //needs numbers udpated and maybe a change focus resets pagination?
    //test pagination
    await testBodyRender([ //test that widget body renders api data on change to widget security focus 
        ['getByText','TEST123']
    ]) 
    await clickPagination('pageForward') //click forward pagination button. Showing costco currently.
    await testBodyRender([ //test that widget body renders api data on change to widget security focus 
        ['getByText','TEST1234']
    ]) 
    await setSecurityFocus(widgetType, 'forex') //select new target security for widget.
    await testBodyRender([ //test that widget body renders api data on change to widget security focus
        ['getByText','COSTTEST1unique']
    ]) 
    await clickPagination('pageForward') //click forward pagination button. Showing costco currently.
    await testBodyRender([ //test that widget body renders api data on change to widget security focus
        ['getByText','COSTTEST11unique']
    ]) 
    await toggleEditPane(widgetType)
    done()
})

it(`Test ${widgetType} Widget: Toggle Button shows config screen.`, async (done) => { 
    //toggle to testing edit pane
    await toggleEditPane(widgetType)
    await waitFor(() => { //test setup screen loaded.
        expect(screen.getByTestId(`removeWidget-${widgetType}`)).toBeInTheDocument()
    })
    done()
})


it(`Test ${widgetType} Widget: Rename widget works.`, async (done) => { 
    await toggleEditPane(widgetType) //toggle to edit pane
    await newWidgetName(widgetType, ['test', 'Test', 'Test!', 'test!$', 'test,', 'renameTookEffect']) //rename widget multiple times
    await toggleEditPane(widgetType) //toggle to data pane.
    expect(screen.getByText('renameTookEffect')).toBeInTheDocument()
    await toggleEditPane(widgetType) //toggle to data pane.
    done()
})






// /**
//  * @jest-environment jsdom
//  */

// //data-testid

// //RENAME .test instad of <div className="xtest"></div>
// import 'whatwg-fetch';
// import React from "react";
// import '@testing-library/jest-dom/extend-expect'
// import { screen, render,  waitFor, fireEvent} from '@testing-library/react'

// //mock network requests
// import { setupServer } from 'msw/node'
// // import { Server } from 'mock-socket';

// //components
// import App from '../../../App'
// import { store } from '../../../store'
// import { Provider } from 'react-redux'

// //mock routes
// import {mockFinnHubData, getDashboard_success, getCheckLogin_success, postFindMongoData_success_noData, postUpdateGQLFilters} from './marketNews.mock'
// import { getFinnDashData_noData, postFinnDashData_noSave }  from '../../../server/routes/mongoDB/finnHubData.mock'
// import { postDashboard_success_noWidgets } from '../../../server/routes/loggedIn/dashboard.mock'
// import { mockFinnHubDataQuote } from '../../../appFunctions/getStockPrices.mock'
// import { mockFinnhubDataStockSymbol } from '../../../slices/sliceExchangeData.mock'
// import { logUiErrorIntercept } from '../../../server/routes/logUiError.mock'
// import { updateGLConfig_success } from '../../../server/routes/mongoDB/setMongoConfig.mock'
// import { findMongoData_empty } from '../../../server/routes/mongoDB/findMongoData.mock'
// import { deleteFinnDashData_success } from '../../../server/routes/mongoDB/deleteMongoRecords.mock'

// //mock service worker for all http requests
// const mockHTTPServer = setupServer(
//     getCheckLogin_success,  //auto login, mock user data
//     getDashboard_success, //default dashboard setup
//     mockFinnHubData, //mock finnhub earnings endpoint 
//     getFinnDashData_noData, //mock mongo cached data empty.
//     postFinnDashData_noSave, //mock post finndashdata save. 
//     postDashboard_success_noWidgets,  //mock save dashboard after loading widget.
//     mockFinnHubDataQuote, //mock finnhub quote data for wathclist menu widget.
//     mockFinnhubDataStockSymbol, //mock stock data for exchange
//     logUiErrorIntercept, //mock and warn about any user interface errors. SHould this force fail?
//     postFindMongoData_success_noData, 
//     postUpdateGQLFilters,
//     updateGLConfig_success, //mock update success.
//     findMongoData_empty, //no data found in mongo
//     deleteFinnDashData_success, //delete success	
//     ) 


// beforeAll(() => {mockHTTPServer.listen({
//     onUnhandledRequest: 'warn',
// })})
// afterAll(() => { mockHTTPServer.close() })

// it('Test Single Widget dashboard : Market News ', async (done) => {
//     //login to dashboard with no widgets.
//     const { debug, getByTestId } = render(
//         <Provider store={store}>
//             <App />
//         </Provider>
//     )
//     await waitFor(() => {
//         expect(screen.getByTestId('dashboardMenu')).toBeInTheDocument()
//     })
//     //add target widget from dropdown
//     fireEvent.mouseOver(getByTestId('widgetsDropdown'));
//     await waitFor(() => {
//         expect(screen.getByTestId('fundamentalsDropDown')).toBeInTheDocument() //estimatesDropDown, fundamentalsDropDown, priceDropDown
//     })
//     fireEvent.mouseOver(screen.getByText('Fundamentals')); //UPDATE WITH Estimate, Fundamentals, Price
//     await waitFor(() => {
//         expect(screen.getByTestId('Market News')).toBeInTheDocument() //copy submenu text
//     })
//     expect(getByTestId('Market News')).toBeInTheDocument() //copy submenu text
//     fireEvent.click(screen.getByTestId('Market News')) //copy submenu text
//     //check widget is mounted
//     await waitFor(() => {
//         expect(screen.getByTestId('marketNewsBody')).toBeInTheDocument() //testID for widgets outer most div
//         //additional tests for widget body render.
//     })
//     // check that edit pane for widget renders and all buttons work
//     expect(screen.getByTestId('editPaneButton-FundamentalsMarketNews')).toBeInTheDocument() //update with widgetID
//     fireEvent.click(getByTestId('editPaneButton-FundamentalsMarketNews')) //update with widgetID
//     await waitFor(() => {
//         //additional tests for widget setup menu render.
//     })
//     //test functionality of widget setup menu
//     //remove target stock example
//     //unmount widget
//     expect(screen.getByTestId('removeWidget-FundamentalsMarketNews')).toBeInTheDocument()  //update with widgetID
//     fireEvent.click(screen.getByTestId('removeWidget-FundamentalsMarketNews')) //update with widgetID
//     await waitFor(() => {
//         expect(screen.queryByTestId('marketNewsBody')).toBe(null) //update widget body tag.
//     })
//     done()
// })








