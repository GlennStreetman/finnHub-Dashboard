import { rest } from 'msw'

const testDashboard = { //setup containing a single dashboard, TEST, and one widget, 16218726766030.
    savedDashBoards: {
        TEST: {
            dashboardname: 'TEST',
            globalstocklist: '{ "US-WMT": { "currency": "USD", "description": "WALMART INC", "displaySymbol": "WMT", "figi": "BBG000BWXBC2", "mic": "XNYS", "symbol": "WMT", "type": "Common Stock", "exchange": "US", "key": "US-WMT" }, "US-COST": { "currency": "USD", "description": "COSTCO WHOLESALE CORP", "displaySymbol": "COST", "figi": "BBG000F6H8W8", "mic": "XNAS", "symbol": "COST", "type": "Common Stock", "exchange": "US", "key": "US-COST" } }',
            id: 1875,
            widgetlist: {}
        }
    },
    menuSetup: {
        watchListMenu: {
            column: 0,
            columnOrder: 0,
            widgetConfig: 'menuWidget',
            widgetHeader: 'WatchList',
            widgetID: 'watchListMenu',
            widgetType: 'watchListMenu',
            xAxis: '5',
            yAxis: '75'
        },
        dashBoardMenu: {
            column: 0,
            columnOrder: 1,
            widgetConfig: 'menuWidget',
            widgetHeader: 'Saved Dashboards',
            widgetID: 'dashBoardMenu',
            widgetType: 'dashBoardMenu',
            xAxis: '46',
            yAxis: '149'
        }
    },
    default: 'TEST',
    message: ''
}

export const getDashboard_success =     //auto login check rejected.
    rest.get("/dashboard", (req, res, ctx) => {
        const resObj = testDashboard
        // console.log('RETURNING DASHBOARD DATA MOCK')
        return res(
            ctx.status(200),
            ctx.json(resObj)
        )
    })

//default data to be returned for test purposes for all stocks.
const resData_WMT = [
    {
        "actual": 1.11,
        "estimate": 1.11,
        "period": "2019-03-31",
        "symbol": "AAPL"
    },
    {
        "actual": 1.11,
        "estimate": 1.11,
        "period": "2018-12-31",
        "symbol": "AAPL"
    },
    {
        "actual": 1.11,
        "estimate": 1.11,
        "period": "2018-09-30",
        "symbol": "AAPL"
    },
    {
        "actual": 1.11,
        "estimate": 1.11,
        "period": "2018-06-30",
        "symbol": "AAPL"
    }
]

const resData_COST = [
    {
        "actual": 1.11,
        "estimate": 1.11,
        "period": "2019-03-31",
        "symbol": "AAPL"
    },
    {
        "actual": 1.11,
        "estimate": 1.11,
        "period": "2018-12-31",
        "symbol": "AAPL"
    },
    {
        "actual": 1.11,
        "estimate": 1.11,
        "period": "2018-09-30",
        "symbol": "AAPL"
    },
    {
        "actual": 1.11,
        "estimate": 1.11,
        "period": "2018-06-30",
        "symbol": "AAPL"
    }
]

export const mockFinnHubData = //MOCK API REQUEST FOR THIS WIDGET. Remember to update api string on next line.
    rest.get("https://finnhub.io/api/v1/stock/earnings*", (req, res, ctx) => {
        const symbol = req.url.searchParams.get('symbol')
        let resData = symbol === 'WMT' ? resData_WMT : resData_COST
        return res(
            ctx.status(200),
            ctx.json(resData)
        )
    })

const exchangeData = [
    {
        "currency": "USD",
        "description": "TESLA INC",
        "displaySymbol": "TSLA",
        "figi": "BBG000N9MNX3",
        "mic": "XNAS",
        "symbol": "TSLA",
        "type": "Common Stock",
        "exchange": "US",
        "key": "US-TSLA"
    },
    {
        "currency": "USD",
        "description": "APPLE INC",
        "displaySymbol": "AAPL",
        "figi": "BBG000B9XRY4",
        "mic": "XNAS",
        "symbol": "AAPL",
        "type": "Common Stock",
        "exchange": "US",
        "key": "US-AAPL"
    }
]


export const mockExchangeData =
    rest.get("https://finnhub.io/api/v1/stock/symbol", (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json(exchangeData)
        )
    })

export const getCheckLogin_success =     //use this if premium route. Update widgetSetup below
    rest.get("/checkLogin", (req, res, ctx) => {
        console.log('check login')
        return res(
            ctx.status(200),
            ctx.json({
                apiKey: 'sandboxTestApiKey', //always include sandbox so that socket server doesnt setup.
                login: 1,
                ratelimit: 25,
                apiAlias: 'alias',
                widgetsetup: '{"EstimatesPriceTarget":true,"PriceSplits":true}', //<--- Make sure this includes widget if premium route.
                exchangelist: ['US'],
                defaultexchange: ['US',]
            })
        )
    })

//data to be returned for test purposes for after filter change.
const resData_WMT_toggle = {
    "earningsCalendar": [
        {
            "date": "2020-01-28",
            "epsActual": 5.51,
            "epsEstimate": 5.55,
            "hour": "amc",
            "quarter": 1,
            "revenueActual": 91819000000,
            "revenueEstimate": 88496400810,
            "symbol": "WMT",
            "year": 2020
        },
        {
            "date": "2019-10-30",
            "epsActual": 6.61,
            "epsEstimate": 6.66,
            "hour": "amc",
            "quarter": 4,
            "revenueActual": 64040000000,
            "revenueEstimate": 62985161760,
            "symbol": "WMT",
            "year": 2019
        }
    ]
}

const resData_COST_toggle = {
    "earningsCalendar": [
        {
            "date": "2020-01-28",
            "epsActual": 7.71,
            "epsEstimate": 7.77,
            "hour": "amc",
            "quarter": 1,
            "revenueActual": 91819000000,
            "revenueEstimate": 88496400810,
            "symbol": "COST",
            "year": 2020
        },
        {
            "date": "2019-10-30",
            "epsActual": 8.81,
            "epsEstimate": 8.88,
            "hour": "amc",
            "quarter": 4,
            "revenueActual": 64040000000,
            "revenueEstimate": 62985161760,
            "symbol": "COST",
            "year": 2019
        }
    ]
}

export const mockFinnHubData_toggle = //MOCK API REQUEST FOR THIS WIDGET. Remember to update api string on next line.
    rest.get("https://finnhub.io/api/v1/calendar/earnings*", (req, res, ctx) => {
        const symbol = req.url.searchParams.get('symbol')
        let resData = symbol === 'WMT' ? resData_WMT_toggle : resData_COST_toggle
        return res(
            ctx.status(200),
            ctx.json(resData)
        )
    })