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
    "earningsCalendar": [
        {
            "date": "2020-01-28",
            "epsActual": 4.99,
            "epsEstimate": 4.5474,
            "hour": "amc",
            "quarter": 1,
            "revenueActual": 91819000000,
            "revenueEstimate": 88496400810,
            "symbol": "AAPL",
            "year": 2020
        },
        {
            "date": "2019-10-30",
            "epsActual": 3.03,
            "epsEstimate": 2.8393,
            "hour": "amc",
            "quarter": 4,
            "revenueActual": 64040000000,
            "revenueEstimate": 62985161760,
            "symbol": "AAPL",
            "year": 2019
        }
    ]
}

const resObj = resData

export const mockFinnHubData = //MOCK API REQUEST FOR THIS WIDGET. Remember to update api string on next line.
    rest.get("https://finnhub.io/api/v1/calendar/earnings*", (req, res, ctx) => {
        console.log('return mocked finnhub data /earnings')
        return res(
            ctx.status(200),
            ctx.json(resObj)
        )
    })
