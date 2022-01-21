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
const resData_WMT = {
    lastUpdated: "2019-06-03 00:00:00",
    symbol: "NFLX",
    targetHigh: 100,
    targetLow: 101,
    targetMean: 102,
    targetMedian: 103,
};

const resData_COST = {
    lastUpdated: "2019-06-03 00:00:00",
    symbol: "NFLX",
    targetHigh: 200,
    targetLow: 201,
    targetMean: 202,
    targetMedian: 203,
};

export const mockFinnHubData = rest.get("https://finnhub.io/api/v1/stock/price-target*", (req, res, ctx) => {
    //MOCK API REQUEST FOR THIS WIDGET. Remember to update api string on next line.
    const symbol = req.url.searchParams.get("symbol");
    let resData = symbol === "WMT" ? resData_WMT : resData_COST;
    return res(ctx.status(200), ctx.json(resData));
});

export const getCheckLogin_success = rest.get("/checkLogin", (req, res, ctx) => {
    //auto login check rejected.
    // console.log('check login')
    return res(
        ctx.status(200),
        ctx.json({
            apiKey: "sandboxTestApiKey", //always include sandbox so that socket server doesnt setup.
            login: 1,
            ratelimit: 25,
            apiAlias: "alias",
            widgetsetup: '{"EstimatesPriceTarget":true,"PriceSplits":true}',
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
