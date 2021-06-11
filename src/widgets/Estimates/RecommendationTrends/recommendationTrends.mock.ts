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
        console.log('RETURNING DASHBOARD DATA MOCK')
        return res(
            ctx.status(200),
            ctx.json(resObj)
        )
    })

//default data to be returned for test purposes for all stocks.
const resData =
    [
        {
            "buy": 24,
            "hold": 7,
            "period": "2020-03-01",
            "sell": 0,
            "strongBuy": 13,
            "strongSell": 0,
            "symbol": "AAPL"
        },
        {
            "buy": 17,
            "hold": 13,
            "period": "2020-02-01",
            "sell": 5,
            "strongBuy": 13,
            "strongSell": 0,
            "symbol": "AAPL"
        }
    ]


const resObj = resData

export const mockFinnHubData =
    rest.get("https://finnhub.io/api/v1/stock/recommendation*", (req, res, ctx) => {
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
                widgetsetup: '{"EstimatesPriceTarget":true}', //UPDATE NEEDED IF premium feature. First item from topNavReg tuple.
                exchangelist: ['US'],
                defaultexchange: ['US',]
            })
        )
    })