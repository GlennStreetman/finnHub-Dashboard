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
const resData_general = [
    {
        "category": "technology",
        "datetime": Date.now(),
        "headline": "Square surges after reporting 64% jump in revenue, more customers using Cash App",
        "id": 5085164,
        "image": "https://image.cnbcfm.com/api/v1/image/105569283-1542050972462rts25mct.jpg?v=1542051069",
        "related": "",
        "source": "TEST123",
        "summary": "Shares of Square soared on Tuesday evening after posting better-than-expected quarterly results and strong growth in its consumer payments app.",
        "url": "https://www.cnbc.com/2020/08/04/square-sq-earnings-q2-2020.html"
    },
    {
        "category": "business",
        "datetime": Date.now(),
        "headline": "B&G Foods CEO expects pantry demand to hold up post-pandemic",
        "id": 5085113,
        "image": "https://image.cnbcfm.com/api/v1/image/106629991-1595532157669-gettyimages-1221952946-362857076_1-5.jpeg?v=1595532242",
        "related": "",
        "source": "CNBC2",
        "summary": "\"I think post-Covid, people will be working more at home, which means people will be eating more breakfast\" and other meals at home, B&G CEO Ken Romanzi said.",
        "url": "https://www.cnbc.com/2020/08/04/bg-foods-ceo-expects-pantry-demand-to-hold-up-post-pandemic.html"
    },
    {
        "category": "top news",
        "datetime": Date.now(),
        "headline": "Anthony Levandowski gets 18 months in prison for stealing Google self-driving car files",
        "id": 5084850,
        "image": "https://image.cnbcfm.com/api/v1/image/106648265-1596584130509-UBER-LEVANDOWSKI.JPG?v=1596584247",
        "related": "",
        "source": "CNBC3",
        "summary": "A U.S. judge on Tuesday sentenced former Google engineer Anthony Levandowski to 18 months in prison for stealing a trade secret from Google related to self-driving cars months before becoming the head of Uber Technologies Inc's rival unit.",
        "url": "https://www.cnbc.com/2020/08/04/anthony-levandowski-gets-18-months-in-prison-for-stealing-google-self-driving-car-files.html"
    },
    {
        "category": "technology",
        "datetime": Date.now(),
        "headline": "Square surges after reporting 64% jump in revenue, more customers using Cash App",
        "id": 5085164,
        "image": "https://image.cnbcfm.com/api/v1/image/105569283-1542050972462rts25mct.jpg?v=1542051069",
        "related": "",
        "source": "CNBC4",
        "summary": "Shares of Square soared on Tuesday evening after posting better-than-expected quarterly results and strong growth in its consumer payments app.",
        "url": "https://www.cnbc.com/2020/08/04/square-sq-earnings-q2-2020.html"
    },
    {
        "category": "business",
        "datetime": Date.now(),
        "headline": "B&G Foods CEO expects pantry demand to hold up post-pandemic",
        "id": 5085113,
        "image": "https://image.cnbcfm.com/api/v1/image/106629991-1595532157669-gettyimages-1221952946-362857076_1-5.jpeg?v=1595532242",
        "related": "",
        "source": "CNBC5",
        "summary": "\"I think post-Covid, people will be working more at home, which means people will be eating more breakfast\" and other meals at home, B&G CEO Ken Romanzi said.",
        "url": "https://www.cnbc.com/2020/08/04/bg-foods-ceo-expects-pantry-demand-to-hold-up-post-pandemic.html"
    },
    {
        "category": "top news",
        "datetime": Date.now(),
        "headline": "Anthony Levandowski gets 18 months in prison for stealing Google self-driving car files",
        "id": 5084850,
        "image": "https://image.cnbcfm.com/api/v1/image/106648265-1596584130509-UBER-LEVANDOWSKI.JPG?v=1596584247",
        "related": "",
        "source": "CNBC6",
        "summary": "A U.S. judge on Tuesday sentenced former Google engineer Anthony Levandowski to 18 months in prison for stealing a trade secret from Google related to self-driving cars months before becoming the head of Uber Technologies Inc's rival unit.",
        "url": "https://www.cnbc.com/2020/08/04/anthony-levandowski-gets-18-months-in-prison-for-stealing-google-self-driving-car-files.html"
    },
    {
        "category": "technology",
        "datetime": Date.now(),
        "headline": "Square surges after reporting 64% jump in revenue, more customers using Cash App",
        "id": 5085164,
        "image": "https://image.cnbcfm.com/api/v1/image/105569283-1542050972462rts25mct.jpg?v=1542051069",
        "related": "",
        "source": "CNBC7",
        "summary": "Shares of Square soared on Tuesday evening after posting better-than-expected quarterly results and strong growth in its consumer payments app.",
        "url": "https://www.cnbc.com/2020/08/04/square-sq-earnings-q2-2020.html"
    },
    {
        "category": "business",
        "datetime": Date.now(),
        "headline": "B&G Foods CEO expects pantry demand to hold up post-pandemic",
        "id": 5085113,
        "image": "https://image.cnbcfm.com/api/v1/image/106629991-1595532157669-gettyimages-1221952946-362857076_1-5.jpeg?v=1595532242",
        "related": "",
        "source": "CNBC8",
        "summary": "\"I think post-Covid, people will be working more at home, which means people will be eating more breakfast\" and other meals at home, B&G CEO Ken Romanzi said.",
        "url": "https://www.cnbc.com/2020/08/04/bg-foods-ceo-expects-pantry-demand-to-hold-up-post-pandemic.html"
    },
    {
        "category": "top news",
        "datetime": Date.now(),
        "headline": "Anthony Levandowski gets 18 months in prison for stealing Google self-driving car files",
        "id": 5084850,
        "image": "https://image.cnbcfm.com/api/v1/image/106648265-1596584130509-UBER-LEVANDOWSKI.JPG?v=1596584247",
        "related": "",
        "source": "CNBC9",
        "summary": "A U.S. judge on Tuesday sentenced former Google engineer Anthony Levandowski to 18 months in prison for stealing a trade secret from Google related to self-driving cars months before becoming the head of Uber Technologies Inc's rival unit.",
        "url": "https://www.cnbc.com/2020/08/04/anthony-levandowski-gets-18-months-in-prison-for-stealing-google-self-driving-car-files.html"
    },
    {
        "category": "technology",
        "datetime": Date.now(),
        "headline": "Square surges after reporting 64% jump in revenue, more customers using Cash App",
        "id": 5085164,
        "image": "https://image.cnbcfm.com/api/v1/image/105569283-1542050972462rts25mct.jpg?v=1542051069",
        "related": "",
        "source": "CNBC10",
        "summary": "Shares of Square soared on Tuesday evening after posting better-than-expected quarterly results and strong growth in its consumer payments app.",
        "url": "https://www.cnbc.com/2020/08/04/square-sq-earnings-q2-2020.html"
    },
    {
        "category": "business",
        "datetime": Date.now(),
        "headline": "B&G Foods CEO expects pantry demand to hold up post-pandemic",
        "id": 5085113,
        "image": "https://image.cnbcfm.com/api/v1/image/106629991-1595532157669-gettyimages-1221952946-362857076_1-5.jpeg?v=1595532242",
        "related": "",
        "source": "TEST1234",
        "summary": "\"I think post-Covid, people will be working more at home, which means people will be eating more breakfast\" and other meals at home, B&G CEO Ken Romanzi said.",
        "url": "https://www.cnbc.com/2020/08/04/bg-foods-ceo-expects-pantry-demand-to-hold-up-post-pandemic.html"
    },
    {
        "category": "top news",
        "datetime": Date.now(),
        "headline": "Anthony Levandowski gets 18 months in prison for stealing Google self-driving car files",
        "id": 5084850,
        "image": "https://image.cnbcfm.com/api/v1/image/106648265-1596584130509-UBER-LEVANDOWSKI.JPG?v=1596584247",
        "related": "",
        "source": "CNBC13",
        "summary": "A U.S. judge on Tuesday sentenced former Google engineer Anthony Levandowski to 18 months in prison for stealing a trade secret from Google related to self-driving cars months before becoming the head of Uber Technologies Inc's rival unit.",
        "url": "https://www.cnbc.com/2020/08/04/anthony-levandowski-gets-18-months-in-prison-for-stealing-google-self-driving-car-files.html"
    },
]

const resData_forex = [
    {
        "category": "technology",
        "datetime": Date.now(),
        "headline": "Square surges after reporting 64% jump in revenue, more customers using Cash App",
        "id": 5085164,
        "image": "https://image.cnbcfm.com/api/v1/image/105569283-1542050972462rts25mct.jpg?v=1542051069",
        "related": "",
        "source": "COSTTEST1unique",
        "summary": "Shares of Square soared on Tuesday evening after posting better-than-expected quarterly results and strong growth in its consumer payments app.",
        "url": "https://www.cnbc.com/2020/08/04/square-sq-earnings-q2-2020.html"
    },
    {
        "category": "business",
        "datetime": Date.now(),
        "headline": "B&G Foods CEO expects pantry demand to hold up post-pandemic",
        "id": 5085113,
        "image": "https://image.cnbcfm.com/api/v1/image/106629991-1595532157669-gettyimages-1221952946-362857076_1-5.jpeg?v=1595532242",
        "related": "",
        "source": "CNBC2",
        "summary": "\"I think post-Covid, people will be working more at home, which means people will be eating more breakfast\" and other meals at home, B&G CEO Ken Romanzi said.",
        "url": "https://www.cnbc.com/2020/08/04/bg-foods-ceo-expects-pantry-demand-to-hold-up-post-pandemic.html"
    },
    {
        "category": "top news",
        "datetime": Date.now(),
        "headline": "Anthony Levandowski gets 18 months in prison for stealing Google self-driving car files",
        "id": 5084850,
        "image": "https://image.cnbcfm.com/api/v1/image/106648265-1596584130509-UBER-LEVANDOWSKI.JPG?v=1596584247",
        "related": "",
        "source": "CNBC3",
        "summary": "A U.S. judge on Tuesday sentenced former Google engineer Anthony Levandowski to 18 months in prison for stealing a trade secret from Google related to self-driving cars months before becoming the head of Uber Technologies Inc's rival unit.",
        "url": "https://www.cnbc.com/2020/08/04/anthony-levandowski-gets-18-months-in-prison-for-stealing-google-self-driving-car-files.html"
    },
    {
        "category": "technology",
        "datetime": Date.now(),
        "headline": "Square surges after reporting 64% jump in revenue, more customers using Cash App",
        "id": 5085164,
        "image": "https://image.cnbcfm.com/api/v1/image/105569283-1542050972462rts25mct.jpg?v=1542051069",
        "related": "",
        "source": "CNBC4",
        "summary": "Shares of Square soared on Tuesday evening after posting better-than-expected quarterly results and strong growth in its consumer payments app.",
        "url": "https://www.cnbc.com/2020/08/04/square-sq-earnings-q2-2020.html"
    },
    {
        "category": "business",
        "datetime": Date.now(),
        "headline": "B&G Foods CEO expects pantry demand to hold up post-pandemic",
        "id": 5085113,
        "image": "https://image.cnbcfm.com/api/v1/image/106629991-1595532157669-gettyimages-1221952946-362857076_1-5.jpeg?v=1595532242",
        "related": "",
        "source": "CNBC5",
        "summary": "\"I think post-Covid, people will be working more at home, which means people will be eating more breakfast\" and other meals at home, B&G CEO Ken Romanzi said.",
        "url": "https://www.cnbc.com/2020/08/04/bg-foods-ceo-expects-pantry-demand-to-hold-up-post-pandemic.html"
    },
    {
        "category": "top news",
        "datetime": Date.now(),
        "headline": "Anthony Levandowski gets 18 months in prison for stealing Google self-driving car files",
        "id": 5084850,
        "image": "https://image.cnbcfm.com/api/v1/image/106648265-1596584130509-UBER-LEVANDOWSKI.JPG?v=1596584247",
        "related": "",
        "source": "CNBC6",
        "summary": "A U.S. judge on Tuesday sentenced former Google engineer Anthony Levandowski to 18 months in prison for stealing a trade secret from Google related to self-driving cars months before becoming the head of Uber Technologies Inc's rival unit.",
        "url": "https://www.cnbc.com/2020/08/04/anthony-levandowski-gets-18-months-in-prison-for-stealing-google-self-driving-car-files.html"
    },
    {
        "category": "technology",
        "datetime": Date.now(),
        "headline": "Square surges after reporting 64% jump in revenue, more customers using Cash App",
        "id": 5085164,
        "image": "https://image.cnbcfm.com/api/v1/image/105569283-1542050972462rts25mct.jpg?v=1542051069",
        "related": "",
        "source": "CNBC7",
        "summary": "Shares of Square soared on Tuesday evening after posting better-than-expected quarterly results and strong growth in its consumer payments app.",
        "url": "https://www.cnbc.com/2020/08/04/square-sq-earnings-q2-2020.html"
    },
    {
        "category": "business",
        "datetime": Date.now(),
        "headline": "B&G Foods CEO expects pantry demand to hold up post-pandemic",
        "id": 5085113,
        "image": "https://image.cnbcfm.com/api/v1/image/106629991-1595532157669-gettyimages-1221952946-362857076_1-5.jpeg?v=1595532242",
        "related": "",
        "source": "CNBC8",
        "summary": "\"I think post-Covid, people will be working more at home, which means people will be eating more breakfast\" and other meals at home, B&G CEO Ken Romanzi said.",
        "url": "https://www.cnbc.com/2020/08/04/bg-foods-ceo-expects-pantry-demand-to-hold-up-post-pandemic.html"
    },
    {
        "category": "top news",
        "datetime": Date.now(),
        "headline": "Anthony Levandowski gets 18 months in prison for stealing Google self-driving car files",
        "id": 5084850,
        "image": "https://image.cnbcfm.com/api/v1/image/106648265-1596584130509-UBER-LEVANDOWSKI.JPG?v=1596584247",
        "related": "",
        "source": "CNBC9",
        "summary": "A U.S. judge on Tuesday sentenced former Google engineer Anthony Levandowski to 18 months in prison for stealing a trade secret from Google related to self-driving cars months before becoming the head of Uber Technologies Inc's rival unit.",
        "url": "https://www.cnbc.com/2020/08/04/anthony-levandowski-gets-18-months-in-prison-for-stealing-google-self-driving-car-files.html"
    },
    {
        "category": "technology",
        "datetime": Date.now(),
        "headline": "Square surges after reporting 64% jump in revenue, more customers using Cash App",
        "id": 5085164,
        "image": "https://image.cnbcfm.com/api/v1/image/105569283-1542050972462rts25mct.jpg?v=1542051069",
        "related": "",
        "source": "COSTTEST10",
        "summary": "Shares of Square soared on Tuesday evening after posting better-than-expected quarterly results and strong growth in its consumer payments app.",
        "url": "https://www.cnbc.com/2020/08/04/square-sq-earnings-q2-2020.html"
    },
    {
        "category": "business",
        "datetime": Date.now(),
        "headline": "B&G Foods CEO expects pantry demand to hold up post-pandemic",
        "id": 5085113,
        "image": "https://image.cnbcfm.com/api/v1/image/106629991-1595532157669-gettyimages-1221952946-362857076_1-5.jpeg?v=1595532242",
        "related": "",
        "source": "COSTTEST11unique",
        "summary": "\"I think post-Covid, people will be working more at home, which means people will be eating more breakfast\" and other meals at home, B&G CEO Ken Romanzi said.",
        "url": "https://www.cnbc.com/2020/08/04/bg-foods-ceo-expects-pantry-demand-to-hold-up-post-pandemic.html"
    },
    {
        "category": "top news",
        "datetime": Date.now(),
        "headline": "Anthony Levandowski gets 18 months in prison for stealing Google self-driving car files",
        "id": 5084850,
        "image": "https://image.cnbcfm.com/api/v1/image/106648265-1596584130509-UBER-LEVANDOWSKI.JPG?v=1596584247",
        "related": "",
        "source": "CNBC13",
        "summary": "A U.S. judge on Tuesday sentenced former Google engineer Anthony Levandowski to 18 months in prison for stealing a trade secret from Google related to self-driving cars months before becoming the head of Uber Technologies Inc's rival unit.",
        "url": "https://www.cnbc.com/2020/08/04/anthony-levandowski-gets-18-months-in-prison-for-stealing-google-self-driving-car-files.html"
    },
]

export const mockFinnHubData = //MOCK API REQUEST FOR THIS WIDGET. Remember to update api string on next line.
    rest.get("https://finnhub.io/api/v1/news*", (req, res, ctx) => {
        const symbol = req.url.searchParams.get('category')
        // console.log('SYMBOl', symbol)
        let resData = symbol === 'general' ? resData_general : resData_forex
        return res(
            ctx.status(200),
            ctx.json(resData)
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
                widgetsetup: '{"FundamentalsFinancialsAsReported":true}', //UPDATE NEEDED IF premium feature. First item from topNavReg tuple.
                exchangelist: 'US,AS',
                defaultexchange: 'US'
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
