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

export const getDashboard_success = rest.get("/dashboard", (req, res, ctx) => { //auto login check rejected.
    const resObj = testDashboard;
    // console.log('RETURNING DASHBOARD DATA MOCK')
    return res(ctx.status(200), ctx.json(resObj));
});

//default data to be returned for test purposes for all stocks.
const resData_WMT = {
    series: {
        annual: {
            currentRatio: [
                {
                    period: "2019-09-28",
                    v: 1.11,
                },
                {
                    period: "2018-09-29",
                    v: 1.11,
                },
            ],
            salesPerShare: [
                {
                    period: "2019-09-28",
                    v: 1.11,
                },
                {
                    period: "2018-09-29",
                    v: 1.11,
                },
            ],
            netMargin: [
                {
                    period: "2019-09-28",
                    v: 1.11,
                },
                {
                    period: "2018-09-29",
                    v: 1.11,
                },
            ],
        },
    },
    metric: {
        "10DayAverageTradingVolume": 1.11,
        "52WeekHigh": 1.12,
        "52WeekLow": 1.13,
        "52WeekLowDate": "2019-01-14",
        "52WeekPriceReturnDaily": 1.14,
        beta: 1.15,
    },
    metricType: "all",
    symbol: "WMT",
};

const resData_COST = {
    series: {
        annual: {
            currentRatio: [
                {
                    period: "2019-09-28",
                    v: 2.11,
                },
                {
                    period: "2018-09-29",
                    v: 2.11,
                },
            ],
            salesPerShare: [
                {
                    period: "2019-09-28",
                    v: 2.11,
                },
                {
                    period: "2018-09-29",
                    v: 2.11,
                },
            ],
            netMargin: [
                {
                    period: "2019-09-28",
                    v: 2.11,
                },
                {
                    period: "2018-09-29",
                    v: 2.11,
                },
            ],
        },
    },
    metric: {
        "10DayAverageTradingVolume": 2.11,
        "52WeekHigh": 2.12,
        "52WeekLow": 2.13,
        "52WeekLowDate": "2019-01-14",
        "52WeekPriceReturnDaily": 2.14,
        beta: 2.15,
    },
    metricType: "all",
    symbol: "COST",
};

export const mockFinnHubData = rest.get("https://finnhub.io/api/v1/stock/metric*", (req, res, ctx) => { //MOCK API REQUEST FOR THIS WIDGET. Remember to update api string on next line.
    // console.log('Returning data!!!!!!!!!!')
    const symbol = req.url.searchParams.get("symbol");
    let resData = symbol === "WMT" ? resData_WMT : resData_COST;
    return res(ctx.status(200), ctx.json(resData));
});

export const getCheckLogin_success = rest.get("/checkLogin", (req, res, ctx) => { //auto login check rejected.
    console.log("get/CheckLogin success, returning login 1");
    return res(
        ctx.status(200),
        ctx.json({
            apiKey: "sandboxTestApiKey", //always include sandbox so that socket server doesnt setup.
            login: 1,
            ratelimit: 100000, //speed up tests with absurd rate limit.
            apiAlias: "alias",
            widgetsetup: '{"FundamentalsBasicFinancials":true}', //UPDATE NEEDED IF premium feature. First item from topNavReg tuple.
            exchangelist: "US,AS",
            defaultexchange: "US",
        })
    );
});

export const postFindMongoData_success_noData = rest.post("/findMongoData", (req, res, ctx) => {
    console.log("post/CheckLogin success, no data");
    return res(ctx.status(200), ctx.json({}));
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

export const finalUpdateToWidgetSetup = rest.post("/findMongoData", (req: any, res, ctx) => {
    // console.log('sending final response')
    const searchList = req.body.searchList;
    const dashboard = req.body.dashboard;
    // const test = (el) => mongoObjects(el, dashboard)
    // test.bind(this)
    const mockRes = searchList.map((el) => mongoObjects(el, dashboard));
    // console.log('MOCKRES', mockRes)
    return res(ctx.status(200), ctx.json(mockRes));
});

const mongoObjects = (key, dashboard) => {
    const searchParams = key.split("-");
    let resData = searchParams[2] === "WMT" ? resData_WMT : resData_COST;
    return {
        _id: "60efb82d6c0878271c7cc57f",
        key: `${dashboard}-${key}`,
        userID: 1,
        apiString: "testString",
        config: {
            toggleMode: "metrics",
            targetSeries: "currentRatio",
            targetSecurity: `${searchParams[1]}-${searchParams[2]}`,
            metricSelection: ["10DayAverageTradingVolume", "52WeekHigh", "52WeekLow"],
            seriesSelection: ["currentRatio", "salesPerShare", "netMargin"],
        },
        dashboard: dashboard,
        data: {
            metric: resData.metric,
            metricType: "all",
            series: resData.series.annual,
            symbol: searchParams[2],
        },
        retrieved: Date.now() - 1000,
        security: `${searchParams[1]}-${searchParams[2]}`,
        stale: Date.now() + 1000 * 60 * 60 * 24,
        widget: searchParams[0],
        widgetName: "Basic Financials",
        widgetType: "FundamentalsBasicFinancials",
    };
};
