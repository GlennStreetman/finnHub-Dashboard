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
const resData_WMT = {
    "cik": "320193",
    "data": [
        {
            "accessNumber": "0000320193-19-000119",
            "symbol": "WMT",
            "cik": "11111-CIK",
            "year": 2019,
            "quarter": 0,
            "form": "10-KWMT",
            "startDate": "2018-09-30 00:00:00",
            "endDate": "2019-09-28 00:00:00",
            "filedDate": "2019-10-31 00:00:00",
            "acceptedDate": "2019-10-30 18:12:36",
            "report": {
                "bs": {
                    "Assets": 338516000000,
                    "Liabilities": 248028000000,
                    "InventoryNet": 4106000000,
                },
                "cf": {
                    "NetIncomeLoss": 55256000000,
                    "InterestPaidNet": 3423000000,
                },
                "ic": {
                    "GrossProfit": 98392000000,
                    "NetIncomeLoss": 55256000000,
                    "OperatingExpenses": 34462000000,
                }
            }
        },
        {
            "accessNumber": "0000320193-19-000119",
            "symbol": "WMT",
            "cik": "11111-CIK2",
            "year": 2019,
            "quarter": 0,
            "form": "10-KWMT2",
            "startDate": "2018-09-30 00:00:00",
            "endDate": "2019-09-28 00:00:00",
            "filedDate": "2019-10-31 00:00:00",
            "acceptedDate": "2019-10-30 18:12:36",
            "report": {
                "bs": {
                    "Assets": 338516000000,
                    "Liabilities": 248028000000,
                    "InventoryNet": 4106000000,
                },
                "cf": {
                    "NetIncomeLoss": 55256000000,
                    "InterestPaidNet": 3423000000,
                },
                "ic": {
                    "GrossProfit": 98392000000,
                    "NetIncomeLoss": 55256000000,
                    "OperatingExpenses": 34462000000,
                }
            }
        }
    ],
    "symbol": "WMT"
}

const resData_COST = {
    "cik": "320193",
    "data": [
        {
            "accessNumber": "0000320193-19-000119",
            "symbol": "COST",
            "cik": "320193-COST",
            "year": 2019,
            "quarter": 0,
            "form": "10-K-COST",
            "startDate": "2018-09-30 00:00:00",
            "endDate": "2019-09-28 00:00:00",
            "filedDate": "2019-10-31 00:00:00",
            "acceptedDate": "2019-10-30 18:12:36",
            "report": {
                "bs": {
                    "Assets": 338516000000,
                    "Liabilities": 248028000000,
                    "InventoryNet": 4106000000,
                },
                "cf": {
                    "NetIncomeLoss": 55256000000,
                    "InterestPaidNet": 3423000000,
                },
                "ic": {
                    "GrossProfit": 98392000000,
                    "NetIncomeLoss": 55256000000,
                    "OperatingExpenses": 34462000000,
                }
            }
        },
        {
            "accessNumber": "0000320193-19-000119",
            "symbol": "COST",
            "cik": "320193-COST2",
            "year": 2019,
            "quarter": 0,
            "form": "10-K-COST2",
            "startDate": "2018-09-30 00:00:00",
            "endDate": "2019-09-28 00:00:00",
            "filedDate": "2019-10-31 00:00:00",
            "acceptedDate": "2019-10-30 18:12:36",
            "report": {
                "bs": {
                    "Assets": 338516000000,
                    "Liabilities": 248028000000,
                    "InventoryNet": 4106000000,
                },
                "cf": {
                    "NetIncomeLoss": 55256000000,
                    "InterestPaidNet": 3423000000,
                },
                "ic": {
                    "GrossProfit": 98392000000,
                    "NetIncomeLoss": 55256000000,
                    "OperatingExpenses": 34462000000,
                }
            }
        }
    ],
    "symbol": "COST"
}

export const mockFinnHubData = //MOCK API REQUEST FOR THIS WIDGET. Remember to update api string on next line.
    rest.get("https://finnhub.io/api/v1/stock/financials-reported*", (req, res, ctx) => {
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

export const getCheckLogin_success =     //auto login check rejected.
    rest.get("/checkLogin", (req, res, ctx) => {
        // console.log('get/CheckLogin success, returning login 1')
        return res(
            ctx.status(200),
            ctx.json({
                apiKey: 'sandboxTestApiKey', //always include sandbox so that socket server doesnt setup.
                login: 1,
                ratelimit: 25,
                apiAlias: 'alias',
                widgetsetup: '{"EstimatesEarningsCalendar":true}', //UPDATE NEEDED IF premium feature. First item from topNavReg tuple.
                exchangelist: ['US'],
                defaultexchange: ['US',]
            })
        )
    })

export const postFindMongoData_success_noData =
    rest.post("/findMongoData", (req, res, ctx) => {
        // console.log('post/CheckLogin success, no data')
        return res(
            ctx.status(200),
            ctx.json({})
        )
    })

export const postUpdateGQLFilters =
    rest.post("/updateGQLFilters", (req, res, ctx) => {
        // console.log('post/CheckLogin success, no data')
        return res(
            ctx.status(200),
            ctx.json({ message: `Update filters Complete` })
        )
    })


