/**
 * @jest-environment jsdom
 */

//data-testid

import 'whatwg-fetch';
import React from "react";
import '@testing-library/jest-dom/extend-expect'
import { screen, render,  waitFor, fireEvent} from '@testing-library/react'

//mock network requests
import { setupServer } from 'msw/node'
// import { Server } from 'mock-socket';

//components
import App from '../../../App'
import { store } from '../../../store'
import { Provider } from 'react-redux'

//mock routes
import {mockFinnHubData, getDashboard_success, getCheckLogin_success} from './priceTarget.mock'
import { getFinnDashData_noData, postFinnDashData_noSave }  from '../../../server/routes/mongoDB/finnHubData.mock'
import { postDashboard_success_noWidgets } from '../../../server/routes/loggedIn/dashboard.mock'
import { mockFinnHubDataQuote } from '../../../appFunctions/getStockPrices.mock'
import { mockFinnhubDataStockSymbol } from '../../../slices/sliceExchangeData.mock'
import { logUiErrorIntercept } from '../../../server/routes/logUiError.mock'
import { updateGLConfig_success } from '../../../server/routes/mongoDB/setMongoConfig.mock'
import { findMongoData_empty } from '../../../server/routes/mongoDB/findMongoData.mock'
import { deleteFinnDashData_success } from '../../../server/routes/mongoDB/deleteMongoRecords.mock'

//mock service worker for all http requests
const mockHTTPServer = setupServer(
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


beforeAll(() => {mockHTTPServer.listen({
    onUnhandledRequest: 'warn',
})})
afterAll(() => { mockHTTPServer.close() })

it('Test Single Widget dashboard : Price Target ', async (done) => {
    //login to dashboard with no widgets.
    const { debug, getByTestId } = render(
        <Provider store={store}>
            <App />
        </Provider>
    )
    await waitFor(() => {
        expect(screen.getByTestId('dashboardMenu')).toBeInTheDocument()
    })
    //add target widget from dropdown
    fireEvent.mouseOver(getByTestId('widgetsDropdown'));
    await waitFor(() => {
        expect(screen.getByTestId('estimatesDropdown')).toBeInTheDocument() //estimatesDropDown, fundamentalsDropdown, priceDropDown
    })
    fireEvent.mouseOver(screen.getByText('Estimate')); //UPDATE WITH Estimate, Fundamental, Price
    await waitFor(() => {
        expect(screen.getByTestId('Price Target')).toBeInTheDocument() //copy submenu text
    })
    expect(getByTestId('Price Target')).toBeInTheDocument() //copy submenu text
    fireEvent.click(screen.getByTestId('Price Target')) //copy submenu text
    //check widget is mounted
    await waitFor(() => {
        expect(screen.getByTestId('priceTargetBody')).toBeInTheDocument() //testID for widgets outer most div
        expect(screen.getByTestId('ptSelectStock')).toBeInTheDocument()
        expect(screen.getByTestId('ptRow')).toBeInTheDocument()
        expect(screen.getByText('Last Updated:')).toBeInTheDocument()
    })
    // check that edit pane for widget renders and all buttons work
    expect(screen.getByTestId('editPaneButton-EstimatesPriceTarget')).toBeInTheDocument() //update with widgetID
    fireEvent.click(getByTestId('editPaneButton-EstimatesPriceTarget')) //update with widgetID
    //test functionality of widget setup menu
    //remove target stock example
    fireEvent.click(screen.getByTestId('remove-US-WMT')) 
    await waitFor(() => {
        expect(screen.queryByTestId('remove-US-WMT')).toBe(null)
        expect(screen.getByTestId('remove-US-COST')).toBeInTheDocument()
    })
    //unmount widget
    expect(screen.getByTestId('removeWidget-EstimatesPriceTarget')).toBeInTheDocument()  //update with widgetID
    fireEvent.click(screen.getByTestId('removeWidget-EstimatesPriceTarget')) //update with widgetID
    await waitFor(() => {
        expect(screen.queryByTestId('priceTargetBody')).toBe(null) //update widget body tag.
    })
    done()
})








