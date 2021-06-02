import { rest } from 'msw'

const testDashboard = { //setup containing a single dashboard, TEST, and one widget, 16218726766030.
    savedDashBoards: {
        TEST: {
            dashboardname: 'TEST',
            globalstocklist: '{"US-WMT":{"currency":"USD","description":"WALMART INC","displaySymbol":"WMT","figi":"BBG000BWXBC2","mic":"XNYS","symbol":"WMT","type":"Common Stock","exchange":"US","key":"US-WMT"},"US-COST":{"currency":"USD","description":"COSTCO WHOLESALE CORP","displaySymbol":"COST","figi":"BBG000F6H8W8","mic":"XNAS","symbol":"COST","type":"Common Stock","exchange":"US","key":"US-COST"},"US-BEST":{"currency":"USD","description":"BEST INC - ADR","displaySymbol":"BEST","figi":"BBG00H1H9511","mic":"XNYS","symbol":"BEST","type":"ADR","exchange":"US","key":"US-BEST"},"US-GME":{"currency":"USD","description":"GAMESTOP CORP-CLASS A","displaySymbol":"GME","figi":"BBG000BB5BF6","mic":"XNYS","symbol":"GME","type":"Common Stock","exchange":"US","key":"US-GME"},"US-HD":{"currency":"USD","description":"HOME DEPOT INC","displaySymbol":"HD","figi":"BBG000BKZB36","mic":"XNYS","symbol":"HD","type":"Common Stock","exchange":"US","key":"US-HD"}}',
            id: 1875,
            widgetlist: {}
        }
    },
    menuSetup: {
        WatchListMenu: {
            column: 0,
            columnOrder: 0,
            widgetConfig: 'menuWidget',
            widgetHeader: 'WatchList',
            widgetID: 'WatchListMenu',
            widgetType: 'WatchListMenu',
            xAxis: '5',
            yAxis: '75'
        },
        DashBoardMenu: {
            column: 0,
            columnOrder: 1,
            widgetConfig: 'menuWidget',
            widgetHeader: 'Saved Dashboards',
            widgetID: 'DashBoardMenu',
            widgetType: 'DashBoardMenu',
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
        console.log('RETURNING DASHBOARD DATA MOCK')
        return res(
            ctx.status(200),
            ctx.json(resObj)
        )
    })

//default data to be returned for test purposes for all stocks.
const resData = {
    "series": {
        "annual": {
            "currentRatio": [
                {
                    "period": "2019-09-28",
                    "v": 1.5401
                },
                {
                    "period": "2018-09-29",
                    "v": 1.1329
                }
            ],
            "salesPerShare": [
                {
                    "period": "2019-09-28",
                    "v": 55.9645
                },
                {
                    "period": "2018-09-29",
                    "v": 53.1178
                }
            ],
            "netMargin": [
                {
                    "period": "2019-09-28",
                    "v": 0.2124
                },
                {
                    "period": "2018-09-29",
                    "v": 0.2241
                }
            ]
        },
        "metric": {
            "10DayAverageTradingVolume": 32.50147,
            "52WeekHigh": 310.43,
            "52WeekLow": 149.22,
            "52WeekLowDate": "2019-01-14",
            "52WeekPriceReturnDaily": 101.96334,
            "beta": 1.2989,
        },
        "metricType": "all",
        "symbol": "AAPL"
    }
}

const resObj = resData

export const mockFinnHubData = //MOCK API REQUEST FOR THIS WIDGET. Remember to update api string on next line.
    rest.get("https://finnhub.io/api/v1/stock/metric*", (req, res, ctx) => {
        console.log('return mocked finnhub data /earnings')
        return res(
            ctx.status(200),
            ctx.json(resObj)
        )
    })

export const getCheckLogin_success =     //auto login check rejected.
    rest.get("/checkLogin", (req, res, ctx) => {
        console.log('get/CheckLogin success, returning login 1')
        return res(
            ctx.status(200),
            ctx.json({
                apiKey: 'sandboxTestApiKey', //always include sandbox so that socket server doesnt setup.
                login: 1,
                ratelimit: 25,
                apiAlias: 'alias',
                widgetsetup: '{"FundamentalsBasicFinancials":true}', //UPDATE NEEDED IF premium feature. First item from topNavReg tuple.
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
