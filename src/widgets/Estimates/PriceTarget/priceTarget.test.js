/**
 * @jest-environment jsdom
*/

import 'whatwg-fetch';
import React from "react";
import '@testing-library/jest-dom/extend-expect'
import { screen, render,  waitFor, fireEvent} from '@testing-library/react' //prettyDOM
import { configure } from '@testing-library/react'

import { setupServer } from 'msw/node'

//components
import App from '../../../App'
import { store } from '../../../store'
import { Provider } from 'react-redux'

//mock routes
import {mockFinnHubData, getDashboard_success, mockExchangeData, getCheckLogin_success } from './priceTarget.mock'
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
// import { clickPagination } from '../../testFunctions/action_clickPagination'
import { toggleEditPane } from '../../testFunctions/action_toggleEditPane'
import { newWidgetName } from '../../testFunctions/action_newWidgetName'
import { addSecurity } from '../../testFunctions/action_addSecurity'
// import { changeFilter } from '../../testFunctions/action_ChangeFilter'

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



const widgetType = 'EstimatesPriceTarget'
const body = 'priceTargetBody'
configure({
    getElementError: (message, container) => {
        const error = new Error(message);
        error.name = 'TestingLibraryElementError';
        error.stack = null;
        return error;
    },
    });

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
    
    await addWidget('estimatesDropdown', 'Estimate', 'Price Target') //mount widget to be tested.
})

afterEach( async ()=>{
    //unmount widget 
    expect(screen.getByTestId(`removeWidget-${widgetType}`)).toBeInTheDocument() 
    fireEvent.click(screen.getByTestId(`removeWidget-${widgetType}`))
    await waitFor(async () => {
        await expect(screen.queryByTestId(body)).toBe(null)
    })
})

it(`Test ${widgetType} Widget: Change focus renders body change. `, async (done) => {

    await testBodyRender([ //test that widget body renders api data.
        ['getByTestId', body], 
        ['getByText', 'Target High:'], 
        ['getByText','100']
    ]) 

    await setSecurityFocus(widgetType, 'US-COST') //select new target security for widget.
    await testBodyRender([ //test that widget body renders api data on change to widget security focus
        ['getByText', 'Target High:'], 
        ['getByText','200']
    ])
    await toggleEditPane(widgetType)
        done()
})

it(`Test ${widgetType} Widget: Toggle Button shows config screen.`, async (done) => { 
    //toggle to testing edit pane
    await toggleEditPane(widgetType)
    await waitFor(() => { //test setup screen loaded.
        expect(screen.getByText('Remove')).toBeInTheDocument()
        expect(screen.getByTestId('remove-US-WMT')).toBeInTheDocument()
        expect(screen.getByTestId('remove-US-COST')).toBeInTheDocument()
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

it(`Test ${widgetType} Widget: Add security from widget config screen works.`, async (done) => { 
    await toggleEditPane(widgetType) //toggle to edit pane
    await addSecurity(widgetType, [['TSLA', 'US-TSLA: TESLA INC'], ['AAPL', 'US-AAPL: APPLE INC']]) //add security to widget with search bar
    await waitFor(() => {
        expect(screen.getByTestId('remove-US-TSLA')).toBeInTheDocument()
        expect(screen.getByTestId('remove-US-AAPL')).toBeInTheDocument()
    })
    done()
})

it(`Test ${widgetType} Widget: Test that removing securities from edit pane works.`, async (done) => { 
    await toggleEditPane(widgetType) //toggle to edit pane
    await fireEvent.click(screen.getByTestId('remove-US-WMT'))    //remove target stock
    await waitFor(async () => {
        await expect(screen.queryByTestId('remove-US-WMT')).toBe(null)
        expect(screen.getByTestId('remove-US-COST')).toBeInTheDocument()
    })
    done()
})







// /**
//  * @jest-environment jsdom
//  */

// //data-testid

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
// import {mockFinnHubData, getDashboard_success, getCheckLogin_success} from './priceTarget.mock'
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
//     updateGLConfig_success, //mock update success.
//     findMongoData_empty, //no data found in mongo
//     deleteFinnDashData_success, //delete success	
//     ) 


// beforeAll(() => {mockHTTPServer.listen({
//     onUnhandledRequest: 'warn',
// })})
// afterAll(() => { mockHTTPServer.close() })

// it('Test Single Widget dashboard : Price Target ', async (done) => {
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
//         expect(screen.getByTestId('estimatesDropdown')).toBeInTheDocument() //estimatesDropDown, fundamentalsDropdown, priceDropDown
//     })
//     fireEvent.mouseOver(screen.getByText('Estimate')); //UPDATE WITH Estimate, Fundamental, Price
//     await waitFor(() => {
//         expect(screen.getByTestId('Price Target')).toBeInTheDocument() //copy submenu text
//     })
//     expect(getByTestId('Price Target')).toBeInTheDocument() //copy submenu text
//     fireEvent.click(screen.getByTestId('Price Target')) //copy submenu text
//     //check widget is mounted
//     await waitFor(() => {
//         expect(screen.getByTestId('priceTargetBody')).toBeInTheDocument() //testID for widgets outer most div
//         expect(screen.getByTestId('ptSelectStock')).toBeInTheDocument()
//         expect(screen.getByTestId('ptRow')).toBeInTheDocument()
//         expect(screen.getByText('Last Updated:')).toBeInTheDocument()
//     })
//     // check that edit pane for widget renders and all buttons work
//     expect(screen.getByTestId('editPaneButton-EstimatesPriceTarget')).toBeInTheDocument() //update with widgetID
//     fireEvent.click(getByTestId('editPaneButton-EstimatesPriceTarget')) //update with widgetID
//     //test functionality of widget setup menu
//     //remove target stock example
//     fireEvent.click(screen.getByTestId('remove-US-WMT')) 
//     await waitFor(() => {
//         expect(screen.queryByTestId('remove-US-WMT')).toBe(null)
//         expect(screen.getByTestId('remove-US-COST')).toBeInTheDocument()
//     })
//     //unmount widget
//     expect(screen.getByTestId('removeWidget-EstimatesPriceTarget')).toBeInTheDocument()  //update with widgetID
//     fireEvent.click(screen.getByTestId('removeWidget-EstimatesPriceTarget')) //update with widgetID
//     await waitFor(() => {
//         expect(screen.queryByTestId('priceTargetBody')).toBe(null) //update widget body tag.
//     })
//     done()
// })








