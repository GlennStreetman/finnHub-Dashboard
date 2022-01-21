/**
 * @jest-environment jsdom
 */

import "whatwg-fetch";
import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { screen, render, waitFor, fireEvent, prettyDOM } from "@testing-library/react"; //prettyDOM
import { configure } from "@testing-library/react";

import { setupServer } from "msw/node";
// import {jest} from 'jest'

//components
import App from "../../../App";
import { store } from "../../../store";
import { Provider } from "react-redux";

//mock routes
import { mockFinnHubData, getDashboard_success, mockExchangeData, mockFinnHubData_toggle } from "./earnigsCalendar.mock";
import { getCheckLogin_success } from "../../../server/routes/loginRoutes/checkLogin.mock";
import { getFinnDashData_noData, postFinnDashData_noSave } from "../../../server/routes/mongoDB/finnHubData.mock";
import { postDashboard_success_noWidgets } from "../../../server/routes/loggedIn/dashboard.mock";
import { mockFinnHubDataQuote } from "../../../appFunctions/getStockPrices.mock";
import { mockFinnhubDataStockSymbol } from "../../../slices/sliceExchangeData.mock";
import { logUiErrorIntercept } from "../../../server/routes/logUiError.mock";
import { updateGLConfig_success } from "../../../server/routes/mongoDB/setMongoConfig.mock";
import { findMongoData_empty } from "../../../server/routes/mongoDB/findMongoData.mock";
import { deleteFinnDashData_success } from "../../../server/routes/mongoDB/deleteMongoRecords.mock";

//test Actions
import { addWidget } from "../../testFunctions/action_addWidget";
import { setSecurityFocus } from "../../testFunctions/action_selectFocus";
import { clickPagination } from "../../testFunctions/action_clickPagination";
import { toggleEditPane } from "../../testFunctions/action_toggleEditPane";
import { newWidgetName } from "../../testFunctions/action_newWidgetName";
import { addSecurity } from "../../testFunctions/action_addSecurity";
import { changeFilter } from "../../testFunctions/action_ChangeFilter";

//test procedures
import { testBodyRender } from "../../testFunctions/test_bodyRender";

// console.error = jest.fn()

jest.mock("./../../../appFunctions/appImport/setupDashboard");
//mock service worker for all http requests
const mockHTTPServer = setupServer(
    mockExchangeData, //exchange data for TSLA and AAPL
    getCheckLogin_success, //auto login, mock user data
    getDashboard_success, //default dashboard setup
    mockFinnHubData, //mock finnhub earnings endpoint
    getFinnDashData_noData, //mock mongo cached data empty.
    postFinnDashData_noSave, //mock post finndashdata save.
    postDashboard_success_noWidgets, //mock save dashboard after loading widget.
    mockFinnHubDataQuote, //mock finnhub quote data for wathclist menu widget.
    mockFinnhubDataStockSymbol, //mock stock data for exchange
    logUiErrorIntercept, //mock and warn about any user interface errors. SHould this force fail?
    updateGLConfig_success, //mock update success.
    findMongoData_empty, //no data found in mongo
    deleteFinnDashData_success //delete success
);

configure({
    getElementError: (message, container) => {
        // console.log('ERROR', message)
        // console.log(prettyDOM(screen.getByTestId(body), 30000))
        const error = new Error(`${message}`); //Debug Node: ${prettyDOM(screen.getByTestId(body), 30000)}
        error.name = "TestingLibraryElementError";
        error.stack = null;
        return error;
    },
});

const widgetType = "EstimatesEarningsCalendar";
const body = "container-EstimatesEarningsCalendar";

beforeAll(() => {
    mockHTTPServer.listen({
        onUnhandledRequest: "warn",
    });
});
afterAll(() => {
    mockHTTPServer.close();
});

beforeEach(async () => {
    jest.mock("throttleQueueAPI");
    jest.mock("setupDashboard");
    const { debug } = render(
        <Provider store={store}>
            <App />
        </Provider>
    );
    await waitFor(() => {
        expect(screen.getByTestId("dashboardMenu")).toBeInTheDocument();
    });
    await addWidget("Stock Estimates", "Earnings Calendar", "container-EstimatesEarningsCalendar"); //mount widget to be tested.
});

it(`Test ${widgetType} Widget: Change focus renders body change. `, async () => {
    await testBodyRender([
        //test that widget body renders api data.
        ["getByTestId", body],
        ["getByText", "Quarter:"],
        ["getByText", "1.11"],
    ]);
    await setSecurityFocus(widgetType, "US-COST"); //select new target security for widget.
    await testBodyRender([
        //test that widget body renders api data on change to widget security focus
        ["getByText", "Quarter:"],
        ["getByText", "3.31"],
    ]);
});

it(`TestWidget unmounts`, async () => {
    await toggleEditPane(widgetType);
    expect(screen.getByTestId(`removeWidget-${widgetType}`)).toBeInTheDocument();
    fireEvent.click(screen.getByTestId(`removeWidget-${widgetType}`));
    await waitFor(async () => {
        await expect(screen.queryByTestId(body)).toBe(null);
    });
});

it(`Test ${widgetType} Widget: Change pagination.`, async () => {
    //needs numbers udpated and maybe a change focus resets pagination?
    //test pagination
    await testBodyRender([
        //test that widget body renders api data on change to widget security focus
        ["getByText", "Quarter:"],
        ["getByText", "1.11"],
    ]);
    await clickPagination("pageForward"); //click forward pagination button. Showing costco currently.
    await testBodyRender([
        //test that widget body renders api data on change to widget security focus
        ["getByText", "Quarter:"],
        ["getByText", "2.21"],
    ]);
    await setSecurityFocus(widgetType, "US-COST"); //select new target security for widget.
    await testBodyRender([
        //test that widget body renders api data on change to widget security focus
        ["getByText", "Quarter:"],
        ["getByText", "3.31"],
    ]);
    await clickPagination("pageForward"); //click forward pagination button. Showing costco currently.
    await testBodyRender([
        //test that widget body renders api data on change to widget security focus
        ["getByText", "Quarter:"],
        ["getByText", "4.41"],
    ]);
    await toggleEditPane(widgetType);
});

it(`Test ${widgetType} Widget: Toggle Button shows config screen.`, async () => {
    //toggle to testing edit pane
    await toggleEditPane(widgetType);
    await waitFor(() => {
        //test setup screen loaded.
        expect(screen.getByText("Remove")).toBeInTheDocument();
        expect(screen.getByTestId("remove-US-WMT")).toBeInTheDocument();
        expect(screen.getByTestId("remove-US-COST")).toBeInTheDocument();
    });
});

it(`Test ${widgetType} Widget: Rename widget works.`, async () => {
    await toggleEditPane(widgetType); //toggle to edit pane
    await newWidgetName(widgetType, ["test", "Test", "Test!", "test!$", "test,", "renameTookEffect"]); //rename widget multiple times
    await toggleEditPane(widgetType); //toggle to data pane.
    expect(screen.getByText("renameTookEffect")).toBeInTheDocument();
    await toggleEditPane(widgetType); //toggle to data pane.
});

it(`Test ${widgetType} Widget: Add security from widget config screen works.`, async () => {
    await toggleEditPane(widgetType); //toggle to edit pane
    await addSecurity(widgetType, [["TSLA", "US-TSLA: TESLA INC"]]); //add security to widget with search bar
    await waitFor(() => {
        expect(screen.getByTestId("remove-US-TSLA")).toBeInTheDocument();
    });
});

it(`Test ${widgetType} Widget: Test that changing filters fetches new data.`, async () => {
    await toggleEditPane(widgetType); //toggle to edit pane
    mockHTTPServer.use(mockFinnHubData_toggle); //toggle retrieval data so that we can test that updating filters pulls new data.
    await changeFilter(widgetType, "1999-01-01");
    await toggleEditPane(widgetType);
    await testBodyRender([
        //test that widget body renders api data on change to widget security focus
        ["getByText", "Quarter:"],
        ["getByText", "5.55"],
    ]);
    await toggleEditPane(widgetType); //toggle to edit pane
});

it(`Test ${widgetType} Widget: Test that removing securities from edit pane works.`, async () => {
    await toggleEditPane(widgetType); //toggle to edit pane
    await fireEvent.click(screen.getByTestId("remove-US-WMT")); //remove target stock
    await waitFor(async () => {
        await expect(screen.queryByTestId("remove-US-WMT")).toBe(null);
        expect(screen.getByTestId("remove-US-COST")).toBeInTheDocument();
    });
});
