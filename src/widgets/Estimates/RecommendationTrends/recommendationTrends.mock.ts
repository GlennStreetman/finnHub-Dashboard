import { rest } from "msw";

const testDashboard = {
    //setup containing a single dashboard, TEST, and one widget, 16218726766030.
    savedDashBoards: {
        TEST: {
            dashboardname: "TEST",
            globalstocklist:
                '{ "US-WMT": { "currency": "USD", "description": "WALMART INC", "displaySymbol": "WMT", "figi": "BBG000BWXBC2", "mic": "XNYS", "symbol": "WMT", "type": "Common Stock", "exchange": "US", "key": "US-WMT" }, "US-COST": { "currency": "USD", "description": "COSTCO WHOLESALE CORP", "displaySymbol": "COST", "figi": "BBG000F6H8W8", "mic": "XNAS", "symbol": "COST", "type": "Common Stock", "exchange": "US", "key": "US-COST" } }',
            id: 1875,
            widgetlist: {},
        },
    },
    menuSetup: {
        watchListMenu: {
            column: 0,
            columnOrder: 0,
            widgetConfig: "menuWidget",
            widgetHeader: "WatchList",
            widgetID: "watchListMenu",
            widgetType: "watchListMenu",
            xAxis: "5",
            yAxis: "75",
        },
        dashBoardMenu: {
            column: 0,
            columnOrder: 1,
            widgetConfig: "menuWidget",
            widgetHeader: "Saved Dashboards",
            widgetID: "dashBoardMenu",
            widgetType: "dashBoardMenu",
            xAxis: "46",
            yAxis: "149",
        },
    },
    default: "TEST",
    message: "",
};

export const getDashboard_success = rest.get("/dashboard", (req, res, ctx) => {
    //auto login check rejected.
    const resObj = testDashboard;
    // console.log('RETURNING DASHBOARD DATA MOCK')
    return res(ctx.status(200), ctx.json(resObj));
});

//default data to be returned for test purposes for all stocks.
const resData_WMT = [
    {
        buy: 1.11,
        hold: 1.11,
        period: "2020-03-01",
        sell: 1.11,
        strongBuy: 1.11,
        strongSell: 1.11,
        symbol: "AAPL",
    },
    {
        buy: 2.22,
        hold: 2.22,
        period: "2020-02-01",
        sell: 2.22,
        strongBuy: 2.22,
        strongSell: 2.22,
        symbol: "AAPL",
    },
];

const resData_COST = [
    {
        buy: 3.33,
        hold: 3.33,
        period: "2020-03-01",
        sell: 3.33,
        strongBuy: 3.33,
        strongSell: 3.33,
        symbol: "COST",
    },
    {
        buy: 4.44,
        hold: 4.44,
        period: "2020-02-01",
        sell: 4.44,
        strongBuy: 4.44,
        strongSell: 4.44,
        symbol: "COST",
    },
];

export const mockFinnHubData = rest.get("https://finnhub.io/api/v1/stock/recommendation*", (req, res, ctx) => {
    const symbol = req.url.searchParams.get("symbol");
    let resData = symbol === "WMT" ? resData_WMT : resData_COST;
    return res(ctx.status(200), ctx.json(resData));
});

export const getCheckLogin_success = rest.get("/checkLogin", (req, res, ctx) => {
    //auto login check rejected.
    // console.log('get/CheckLogin success, returning login 1')
    return res(
        ctx.status(200),
        ctx.json({
            apiKey: "sandboxTestApiKey", //always include sandbox so that socket server doesnt setup.
            login: 1,
            ratelimit: 25,
            apiAlias: "alias",
            widgetsetup: '{"EstimatesPriceTarget":true}', //UPDATE NEEDED IF premium feature. First item from topNavReg tuple.
            exchangelist: "US,AS",
            defaultexchange: "US",
        })
    );
});

const exchangeData = [
    {
        currency: "USD",
        description: "TESLA INC",
        displaySymbol: "TSLA",
        figi: "BBG000N9MNX3",
        mic: "XNAS",
        symbol: "TSLA",
        type: "Common Stock",
        exchange: "US",
        key: "US-TSLA",
    },
    {
        currency: "USD",
        description: "APPLE INC",
        displaySymbol: "AAPL",
        figi: "BBG000B9XRY4",
        mic: "XNAS",
        symbol: "AAPL",
        type: "Common Stock",
        exchange: "US",
        key: "US-AAPL",
    },
];

export const mockExchangeData = rest.get("https://finnhub.io/api/v1/stock/symbol", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(exchangeData));
});
