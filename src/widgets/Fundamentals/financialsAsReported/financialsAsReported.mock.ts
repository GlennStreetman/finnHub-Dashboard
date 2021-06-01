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
    "cik": "320193",
    "data": [
        {
            "accessNumber": "0000320193-19-000119",
            "symbol": "AAPL",
            "cik": "320193",
            "year": 2019,
            "quarter": 0,
            "form": "10-K",
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
    "symbol": "AAPL"
}

const resObj = resData

export const mockFinnHubData = //MOCK API REQUEST FOR THIS WIDGET. Remember to update api string on next line.
    rest.get("https://finnhub.io/api/v1/stock/financials-reported*", (req, res, ctx) => {
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
                widgetsetup: '{"EstimatesEarningsCalendar":true}', //UPDATE NEEDED IF premium feature. First item from topNavReg tuple.
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

