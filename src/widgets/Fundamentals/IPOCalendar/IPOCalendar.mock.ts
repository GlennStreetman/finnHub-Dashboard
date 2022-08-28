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
    rest.get("/api/dashboard", (req, res, ctx) => {
        const resObj = testDashboard
        // console.log('RETURNING DASHBOARD DATA MOCK')
        return res(
            ctx.status(200),
            ctx.json(resObj)
        )
    })

//default data to be returned for test purposes for all stocks.
const resData_WMT = {
    "ipoCalendar": [
        {
            "date": "2020-04-03",
            "exchange": "NASDAQ Global",
            "name": "Walmarttest",
            "numberOfShares": 7650000,
            "price": "16.00-18.00",
            "status": "expected1",
            "symbol": "ZNTL",
            "totalSharesValue": 158355000
        },
        {
            "date": "2020-04-01",
            "exchange": "NASDAQ Global",
            "name": "Walmarttest2",
            "numberOfShares": 5000000,
            "price": "5.50-7.50",
            "status": "expected2",
            "symbol": "WIMI",
            "totalSharesValue": 43125000
        },
    ]
}

export const mockFinnHubData = //MOCK API REQUEST FOR THIS WIDGET. Remember to update api string on next line.
    rest.get("https://finnhub.io/api/v1/calendar/ipo*", (req, res, ctx) => {
        // console.log('returning finnhub data')
        const symbol = req.url.searchParams.get('symbol')
        let resData = symbol === 'WMT' ? resData_WMT : resData_WMT
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

export const getCheckLogin_success =     //auto login check rejected.
    rest.get("/api/checkLogin", (req, res, ctx) => {
        console.log('get/CheckLogin success, returning login 1')
        return res(
            ctx.status(200),
            ctx.json({
                apiKey: 'sandboxTestApiKey', //always include sandbox so that socket server doesnt setup.
                login: 1,
                ratelimit: 25,
                apiAlias: 'alias',
                widgetsetup: '{"FundamentalsFinancialsAsReported":true}', //UPDATE NEEDED IF premium feature. First item from topNavReg tuple.
                exchangelist: ['US'],
                defaultexchange: ['US',]
            })
        )
    })

export const postFindMongoData_success_noData =
    rest.post("/findMongoData", (req, res, ctx) => {
        console.log('post/CheckLogin success, no data')
        return res(
            ctx.status(200),
            ctx.json({})
        )
    })

export const postUpdateGQLFilters =
    rest.post("/updateGQLFilters", (req, res, ctx) => {
        console.log('post/CheckLogin success, no data')
        return res(
            ctx.status(200),
            ctx.json({ message: `Update filters Complete` })
        )
    })

//data to be returned for test purposes for after filter change.
const resData_WMT_toggle = {
    "ipoCalendar": [
        {
            "date": "2020-04-03",
            "exchange": "NASDAQ Global",
            "name": "Walmarttest3",
            "numberOfShares": 7650000,
            "price": "16.00-18.00",
            "status": "expected3",
            "symbol": "ZNTL",
            "totalSharesValue": 158355000
        },
        {
            "date": "2020-04-01",
            "exchange": "NASDAQ Global",
            "name": "Walmarttest3",
            "numberOfShares": 5000000,
            "price": "5.50-7.50",
            "status": "expected2",
            "symbol": "WIMI",
            "totalSharesValue": 43125000
        },
    ]
}

export const mockFinnHubData_toggle = //MOCK API REQUEST FOR THIS WIDGET. Remember to update api string on next line.
    rest.get("https://finnhub.io/api/v1/calendar/ipo*", (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json(resData_WMT_toggle)
        )
    })

