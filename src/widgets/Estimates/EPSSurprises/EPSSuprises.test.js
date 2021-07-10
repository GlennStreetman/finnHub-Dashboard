/**
 * @jest-environment jsdom
 */

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
import { getCheckLogin_success } from '../../../server/routes/loginRoutes/checkLogin.mock'
import { getFinnDashData_noData, postFinnDashData_noSave }  from '../../../server/routes/mongoDB/finnHubData.mock'
import {mockFinnHubDataEarnings, getDashboard_success_EPSWidget} from './EPSSuprises.mock'
import {postDashboard_success_noWidgets} from '../../../server/routes/loggedIn/dashboard.mock'
import {mockFinnHubDataQuote} from '../../../appFunctions/getStockPrices.mock'
import {mockFinnhubDataStockSymbol} from '../../../slices/sliceExchangeData.mock'
import {logUiErrorIntercept} from '../../../server/routes/logUiError.mock'
import { updateGLConfig_success } from '../../../server/routes/mongoDB/setMongoConfig.mock'
import { findMongoData_empty } from '../../../server/routes/mongoDB/findMongoData.mock'
import { deleteFinnDashData_success } from '../../../server/routes/mongoDB/deleteMongoRecords.mock'

//mock service worker for all http requests
const mockHTTPServer = setupServer(
    getCheckLogin_success,  //auto login, mock user data
    getDashboard_success_EPSWidget, //default dashboard setup
    mockFinnHubDataEarnings, //mock finnhub earnings endpoint 
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

it('Test Single Widget dashboard : EPS Surprises ', async (done) => {
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
    fireEvent.mouseOver(screen.getByText('Estimate')); //Estimate, Fundamental, Price
    await waitFor(() => {
        expect(screen.getByTestId('Earnings Calendar')).toBeInTheDocument() //copy submenu text
    })
    expect(getByTestId('EPS Surprises')).toBeInTheDocument() 
    fireEvent.click(screen.getByTestId('EPS Surprises')) //copy submenu text
    //check widget is mounted
    await waitFor(() => {
        expect(screen.getByTestId('EPSSuprisesBody')).toBeInTheDocument()
        expect(screen.getByTestId('SelectionLabel')).toBeInTheDocument()
        expect(screen.getByTestId('EPSChart')).toBeInTheDocument()
        expect(screen.getByTestId('canvasChart')).toBeInTheDocument()
    })
    //check that edit pane for widget renders and all buttons work
    expect(screen.getByTestId('editPaneButton-EstimatesEPSSurprises')).toBeInTheDocument() 
    fireEvent.click(getByTestId('editPaneButton-EstimatesEPSSurprises'))
    await waitFor(() => {
        expect(screen.getByText('Remove')).toBeInTheDocument()
        expect(screen.getByTestId('remove-US-WMT')).toBeInTheDocument()
        expect(screen.getByTestId('remove-US-COST')).toBeInTheDocument()
    })
    //remove target stock
    fireEvent.click(screen.getByTestId('remove-US-WMT'))
    await waitFor(() => {
        expect(screen.queryByTestId('remove-US-WMT')).toBe(null)
        expect(screen.getByTestId('remove-US-COST')).toBeInTheDocument()
    })
    //unmount widget
    expect(screen.getByTestId('removeWidget-EstimatesEPSSurprises')).toBeInTheDocument() 
    fireEvent.click(screen.getByTestId('removeWidget-EstimatesEPSSurprises'))
    await waitFor(() => {
        expect(screen.queryByTestId('EPSSuprisesBody')).toBe(null)
    })
    done()
})








