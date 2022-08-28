/**
 * @jest-environment jsdom
 */

jest.mock("../../../appFunctions/appImport/throttleQueueAPI"); //throttleQueueAPI
jest.mock("../../../appFunctions/appImport/setupDashboard");
jest.mock("../../../components/searchSecurity");

import "whatwg-fetch";
import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { screen, render, waitFor, fireEvent, prettyDOM } from "@testing-library/react"; //prettyDOM
import { configure } from "@testing-library/react";

import { setupServer } from "msw/node";

//components
import App from "../../../App";
import { store } from "../../../store";
import { Provider } from "react-redux";

//mock routes
import { mockFinnHubData, getDashboard_success, mockExchangeData, finalUpdateToWidgetSetup } from "./basicFinancials.mock"; //if premium route add checkLogin override to .mock.ts file.
import { getCheckLogin_success } from "../../../server/routes/loginRoutes/checkLogin.mock"; // <--override on line above IF premium route
import { getFinnDashData_noData, postFinnDashData_noSave } from "../../../server/routes/mongoDB/finnHubData.mock";
import { postDashboard_success_noWidgets } from "../../../server/routes/loggedIn/dashboard.mock";
import { mockFinnHubDataQuote } from "../../../appFunctions/getStockPrices.mock";
import { logUiErrorIntercept } from "../../../server/routes/logUiError.mock";
import { updateGLConfig_success } from "../../../server/routes/mongoDB/setMongoConfig.mock";
import { findMongoData_empty } from "../../../server/routes/mongoDB/findMongoData.mock";
import { deleteFinnDashData_success } from "../../../server/routes/mongoDB/deleteMongoRecords.mock";

//test Actions
import { addWidget } from "../../testFunctions/action_addWidget";
import { toggleEditPane } from "../../testFunctions/action_toggleEditPane";
import { newWidgetName } from "../../testFunctions/action_newWidgetName";
import { addSecurity } from "../../testFunctions/action_addSecurity";
import { clickRadioButton } from "../../testFunctions/action_clickRadioButton";
import { setButtonOptionSelection } from "../../testFunctions/action_setButtonOptionSelection"; //

//test procedures
import { testBodyRender } from "../../testFunctions/test_bodyRender";

//mock service worker for all http requests
const mockHTTPServer = setupServer(
    mockFinnHubData,
    mockExchangeData, //exchange data for TSLA and AAPL
    getCheckLogin_success, //auto login, mock user data
    getDashboard_success, //default dashboard setup
    getFinnDashData_noData, //mock mongo cached data empty.
    postFinnDashData_noSave, //mock post finndashdata save.
    postDashboard_success_noWidgets, //mock save dashboard after loading widget.
    mockFinnHubDataQuote, //mock finnhub quote data for wathclist menu widget.
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

const widgetType = "FundamentalsBasicFinancials";
const body = "container-basicFinancialsBody";

beforeAll(() => {
    mockHTTPServer.listen({
        onUnhandledRequest: "warn",
    });
});
afterAll(() => {
    mockHTTPServer.close();
});

beforeEach(async () => {
    const { debug } = render(
        <Provider store={store}>
            <App />
        </Provider>
    );
    await waitFor(() => {
        expect(screen.getByTestId("dashboardMenu")).toBeInTheDocument();
    });

    await addWidget("Stock Fundamentals", "Basic Financials", body); //mount widget to be tested.
});

test(`Test ${widgetType} Widget: Select metrics. Check data renders.`, async () => {
    await toggleEditPane(widgetType); //show widget config menu. Configure. Test API data renders.

    await testBodyRender([
        //test that widget body renders api data.
        ["getByText", "10 Day"],
        ["getByTestId", "0bfSelectMetric"],
    ]);
    mockHTTPServer.use(finalUpdateToWidgetSetup);
    clickRadioButton("0bfSelectMetric"); //select first metric
    clickRadioButton("1bfSelectMetric"); //select second metric
    clickRadioButton("2bfSelectMetric"); //select third metric

    await clickRadioButton("bfSelectSeries"); //switch to series view
    await testBodyRender([
        //test that widget body renders api data.
        ["getByText", "Current Ratio"],
    ]);

    clickRadioButton("0bfSelectSeries"); //select first series
    clickRadioButton("1bfSelectSeries"); //select second series
    clickRadioButton("2bfSelectSeries"); //select third series

    await clickRadioButton("bfSelectMetrics"); //switch back to metrics view
    await toggleEditPane(widgetType); //return to widget data screen
    await testBodyRender([
        //test that widget body renders api data.
        // ["getByText", "1.11"],
        ["getByText", "US-WMT:"],
    ]);

    await setButtonOptionSelection("modeSelector", "series");
    await testBodyRender([
        //does a chart render?
        ["getByText", "Show:"],
        ["getByTestId", "chart-US-WMT"],
    ]);

    await setButtonOptionSelection("selectStock", "US-COST"); //switch focus
    await testBodyRender([
        //does a chart render?
        ["getByText", "Show:"],
        ["getByTestId", "chart-US-COST"],
    ]);

    await setButtonOptionSelection("modeSelector", "metrics");

    await toggleEditPane(widgetType); //show widget config menu.
    await testBodyRender([
        //test that widget body renders api data.
        ["getByText", "10 Day Average Trading Volume"],
        ["getByTestId", "0bfSelectMetric"],
    ]);
});

test(`Test ${widgetType} Widget: Rename widget works.`, async () => {
    await toggleEditPane(widgetType); //toggle to edit pane
    await newWidgetName(widgetType, ["test", "Test", "Test!", "test!$", "test,", "renameTookEffect"]); //rename widget multiple times
    await toggleEditPane(widgetType); //toggle to data pane.
    expect(screen.getByText("renameTookEffect")).toBeInTheDocument();
    await toggleEditPane(widgetType); //toggle to data pane.
});

// test(`Test ${widgetType} Widget: Add security from widget config screen works.`, async () => {
//     await toggleEditPane(widgetType); //toggle to edit pane
//     fireEvent.click(screen.getByTestId(`symbolViewSelector`));
//     await addSecurity(widgetType, [["TSLA", "US-TSLA: TESLA INC"]]); //add security to widget with search bar. Tests change took effect on each iteration.
//     await waitFor(() => {
//         expect(screen.getByTestId("symbolViewSelector")).toBeInTheDocument();
//     });
//     await waitFor(() => {
//         expect(screen.getByTestId("remove-US-TSLA")).toBeInTheDocument();
//     });
// });

test(`Test ${widgetType} Widget: Test that removing securities from edit pane works.`, async () => {
    await toggleEditPane(widgetType); //toggle to edit pane
    fireEvent.click(screen.getByTestId(`symbolViewSelector`));
    await fireEvent.click(screen.getByTestId("remove-US-WMT")); //remove target stock
    await waitFor(async () => {
        await expect(screen.queryByTestId("remove-US-WMT")).toBe(null);
        expect(screen.getByTestId("remove-US-COST")).toBeInTheDocument();
    });
});
