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
import {mockFinnHubData, getDashboard_success} from './earnigsCalendar.mock'
import { getCheckLogin_success } from '../../../server/routes/loginRoutes/checkLogin.mock'
import { getFinnDashData_noData, postFinnDashData_noSave }  from '../../../server/routes/mongoDB/finnHubData.mock'
import { postDashboard_success_noWidgets } from '../../../server/routes/loggedIn/dashboard.mock'
import { mockFinnHubDataQuote } from '../../../appFunctions/getStockPrices.mock'
import { mockFinnhubDataStockSymbol } from '../../../slices/sliceExchangeData.mock'
import { logUiErrorIntercept } from '../../../server/routes/logUiError.mock'

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
    logUiErrorIntercept //mock and warn about any user interface errors. SHould this force fail?
    ) 


beforeAll(() => {mockHTTPServer.listen({
    onUnhandledRequest: 'warn',
})})
afterAll(() => { mockHTTPServer.close() })

it('Test Single Widget dashboard : EarningsCalendar ', async (done) => {
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
    expect(getByTestId('Earnings Calendar')).toBeInTheDocument() 
    fireEvent.click(screen.getByTestId('Earnings Calendar')) //copy submenu text
    //check widget is mounted
    await waitFor(() => {
        expect(screen.getByTestId('earningsCalendarBody')).toBeInTheDocument()
        // screen.debug(screen.getByTestId('earningsCalendarBody'))
        expect(screen.getByTestId('ECstockSelector')).toBeInTheDocument()
        expect(screen.getByTestId('ECDisplaySelector')).toBeInTheDocument()
        expect(screen.getByText('Quarter')).toBeInTheDocument()
        expect(screen.getByText('4.99')).toBeInTheDocument()
    })
    // check that edit pane for widget renders and all buttons work
    expect(screen.getByTestId('editPaneButton-EstimatesEarningsCalendar')).toBeInTheDocument() 
    fireEvent.click(getByTestId('editPaneButton-EstimatesEarningsCalendar'))
    await waitFor(() => {
        expect(screen.getByText('Symbol:')).toBeInTheDocument()
        expect(screen.getByTestId('remove-US-WMT')).toBeInTheDocument()
        expect(screen.getByTestId('remove-US-COST')).toBeInTheDocument()
        expect(screen.getByText('Start date:')).toBeInTheDocument()
    })
    //remove target stock
    fireEvent.click(screen.getByTestId('remove-US-WMT'))
    await waitFor(() => {
        expect(screen.queryByTestId('remove-US-WMT')).toBe(null)
        expect(screen.getByTestId('remove-US-COST')).toBeInTheDocument()
    })
    //unmount widget
    expect(screen.getByTestId('removeWidget-EstimatesEarningsCalendar')).toBeInTheDocument() 
    fireEvent.click(screen.getByTestId('removeWidget-EstimatesEarningsCalendar'))
    await waitFor(() => {
        expect(screen.queryByTestId('earningsCalendarBody')).toBe(null)
    })
    done()
})








