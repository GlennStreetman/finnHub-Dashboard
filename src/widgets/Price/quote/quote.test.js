/**
 * @jest-environment jsdom
 */

//data-testid

//RENAME .test instad of <div className="xtest"></div>
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
import {mockFinnHubData, getDashboard_success, getCheckLogin_success, postFindMongoData_success_noData, postUpdateGQLFilters} from './quote.mock'
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
    postFindMongoData_success_noData, 
    postUpdateGQLFilters,
    updateGLConfig_success, //mock update success.
    findMongoData_empty, //no data found in mongo
    deleteFinnDashData_success, //delete success
    ) 


beforeAll(() => {mockHTTPServer.listen({
    onUnhandledRequest: 'warn',
})})
afterAll(() => { mockHTTPServer.close() })

it('Test Single Widget dashboard : quote ', async (done) => {
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
        expect(screen.getByTestId('priceDropDown')).toBeInTheDocument() //estimatesDropDown, fundamentalsDropDown, priceDropDown
    })
    fireEvent.mouseOver(screen.getByText('Price Data')); //UPDATE WITH Estimate, Fundamentals, Price
    await waitFor(() => {
        expect(screen.getByTestId('Quote')).toBeInTheDocument() //copy submenu text
    })
    expect(getByTestId('Quote')).toBeInTheDocument() //copy submenu text
    fireEvent.click(screen.getByTestId('Quote')) //copy submenu text
    //check widget is mounted
    await waitFor(() => {
        expect(screen.getByTestId('quoteBody')).toBeInTheDocument() //testID for widgets outer most div
        //additional tests for widget body render.
    })
    // check that edit pane for widget renders and all buttons work
    expect(screen.getByTestId('editPaneButton-PriceQuote')).toBeInTheDocument() //update with widgetID
    fireEvent.click(getByTestId('editPaneButton-PriceQuote')) //update with widgetID
    await waitFor(() => {
        //additional tests for widget setup menu render.
    })
    //test functionality of widget setup menu
    //remove target stock example
    fireEvent.click(screen.getByTestId('remove-US-WMT')) 
    await waitFor(() => {
        expect(screen.queryByTestId('remove-US-WMT')).toBe(null)
        expect(screen.getByTestId('remove-US-COST')).toBeInTheDocument()
    })
    //unmount widget
    expect(screen.getByTestId('removeWidget-PriceQuote')).toBeInTheDocument()  //update with widgetID
    fireEvent.click(screen.getByTestId('removeWidget-PriceQuote')) //update with widgetID
    await waitFor(() => {
        expect(screen.queryByTestId('quoteBody')).toBe(null) //update widget body tag.
    })
    done()
})








