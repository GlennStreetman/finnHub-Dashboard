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
        "category": "company news",
        "datetime": 1569550360,
        "headline": "Walmart Headline 1",
        "id": 25286,
        "image": "https://img.etimg.com/thumb/msid-71321314,width-1070,height-580,imgsize-481831,overlay-economictimes/photo.jpg",
        "related": "AAPL",
        "source": "Walmart Source 1",
        "summary": "NEW DELHI | CHENNAI: India may have to offer electronic manufacturers additional sops such as cheap credit and incentives for export along with infrastructure support in order to boost production and help the sector compete with China, Vietnam and Thailand, according to a top government official.These incentives, over and above the proposed reduction of corporate tax to 15% for new manufacturing units, are vital for India to successfully attract companies looking to relocate manufacturing facilities.“While the tax announcements made last week send a very good signal, in order to help attract investments, we will need additional initiatives,” the official told ET, pointing out that Indian electronic manufacturers incur 8-10% higher costs compared with other Asian countries.Sops that are similar to the incentives for export under the existing Merchandise Exports from India Scheme (MEIS) are what the industry requires, the person said.MEIS gives tax credit in the range of 2-5%. An interest subvention scheme for cheaper loans and a credit guarantee scheme for plant and machinery are some other possible measures that will help the industry, the official added.“This should be 2.0 (second) version of the electronic manufacturing cluster (EMC) scheme, which is aimed at creating an ecosystem with an anchor company plus its suppliers to operate in the same area,” he said.Last week, finance minister Nirmala Sitharaman announced a series of measures to boost economic growth including a scheme allowing any new manufacturing company incorporated on or after October 1, to pay income tax at 15% provided the company does not avail of any other exemption or incentives.",
        "url": "https://economictimes.indiatimes.com/industry/cons-products/electronics/more-sops-needed-to-boost-electronic-manufacturing-top-govt-official/articleshow/71321308.cms"
    },
    {
        "category": "company news",
        "datetime": 1569528720,
        "headline": "Walmart Headline 2",
        "id": 25287,
        "image": "https://amp.businessinsider.com/images/5d8d16182e22af6ab66c09e9-1536-768.jpg",
        "related": "AAPL",
        "source": "Walmart Source 2",
        "summary": "You can disable comments on your own YouTube video if you don't want people to comment on it. It's easy to disable comments on YouTube by adjusting the settings for one of your videos in the beta or classic version of YouTube Studio. Visit Business Insider's homepage for more stories . The comments section has a somewhat complicated reputation for creators, especially for those making videos on YouTube . While it can be useful to get the unfiltered opinions of your YouTube viewers and possibly forge a closer connection with them, it can also open you up to quite a bit of negativity. So it makes sense that there may be times when you want to turn off the feature entirely. Just keep in mind that the action itself can spark conversation. If you decide that you don't want to let people leave comments on your YouTube video, here's how to turn off the feature, using either the classic or beta version of the creator studio: How to disable comments on YouTube in YouTube Studio (beta) 1. Go to youtube.com and log into your account, if necessary. 2.",
        "url": "https://www.businessinsider.com/how-to-disable-comments-on-youtube"
    },
    {
        "category": "company news",
        "datetime": 1569526180,
        "headline": "Walmart Headline 3",
        "id": 25341,
        "image": "http://s.thestreet.com/files/tsc/v2008/photos/contrib/uploads/ba140938-d409-11e9-822b-fda891ce1fc1.png",
        "related": "AAPL",
        "source": "Walmart Source 3",
        "summary": "STMicroelectronics and Sony each appear to be supplying four chips for Apple's latest flagship iPhones. Many other historical iPhone suppliers also make appearances in the latest teardowns….STM",
        "url": "https://realmoney.thestreet.com/investing/technology/iphone-11-pro-teardowns-look-encouraging-for-stmicro-sony-15105767"
    },
    {
        "category": "company news",
        "datetime": 1569526180,
        "headline": "Walmart Headline 3",
        "id": 25341,
        "image": "http://s.thestreet.com/files/tsc/v2008/photos/contrib/uploads/ba140938-d409-11e9-822b-fda891ce1fc1.png",
        "related": "AAPL",
        "source": "Walmart Source 3",
        "summary": "STMicroelectronics and Sony each appear to be supplying four chips for Apple's latest flagship iPhones. Many other historical iPhone suppliers also make appearances in the latest teardowns….STM",
        "url": "https://realmoney.thestreet.com/investing/technology/iphone-11-pro-teardowns-look-encouraging-for-stmicro-sony-15105767"
    },
    {
        "category": "company news",
        "datetime": 1569526180,
        "headline": "Walmart Headline 3",
        "id": 25341,
        "image": "http://s.thestreet.com/files/tsc/v2008/photos/contrib/uploads/ba140938-d409-11e9-822b-fda891ce1fc1.png",
        "related": "AAPL",
        "source": "Walmart Source 3",
        "summary": "STMicroelectronics and Sony each appear to be supplying four chips for Apple's latest flagship iPhones. Many other historical iPhone suppliers also make appearances in the latest teardowns….STM",
        "url": "https://realmoney.thestreet.com/investing/technology/iphone-11-pro-teardowns-look-encouraging-for-stmicro-sony-15105767"
    },
    {
        "category": "company news",
        "datetime": 1569526180,
        "headline": "Walmart Headline 4",
        "id": 25341,
        "image": "http://s.thestreet.com/files/tsc/v2008/photos/contrib/uploads/ba140938-d409-11e9-822b-fda891ce1fc1.png",
        "related": "AAPL",
        "source": "Walmart Source 3",
        "summary": "STMicroelectronics and Sony each appear to be supplying four chips for Apple's latest flagship iPhones. Many other historical iPhone suppliers also make appearances in the latest teardowns….STM",
        "url": "https://realmoney.thestreet.com/investing/technology/iphone-11-pro-teardowns-look-encouraging-for-stmicro-sony-15105767"
    },
    {
        "category": "company news",
        "datetime": 1569526180,
        "headline": "Walmart Headline 5",
        "id": 25341,
        "image": "http://s.thestreet.com/files/tsc/v2008/photos/contrib/uploads/ba140938-d409-11e9-822b-fda891ce1fc1.png",
        "related": "AAPL",
        "source": "Walmart Source 3",
        "summary": "STMicroelectronics and Sony each appear to be supplying four chips for Apple's latest flagship iPhones. Many other historical iPhone suppliers also make appearances in the latest teardowns….STM",
        "url": "https://realmoney.thestreet.com/investing/technology/iphone-11-pro-teardowns-look-encouraging-for-stmicro-sony-15105767"
    },
    {
        "category": "company news",
        "datetime": 1569526180,
        "headline": "Walmart Headline 6",
        "id": 25341,
        "image": "http://s.thestreet.com/files/tsc/v2008/photos/contrib/uploads/ba140938-d409-11e9-822b-fda891ce1fc1.png",
        "related": "AAPL",
        "source": "Walmart Source 3",
        "summary": "STMicroelectronics and Sony each appear to be supplying four chips for Apple's latest flagship iPhones. Many other historical iPhone suppliers also make appearances in the latest teardowns….STM",
        "url": "https://realmoney.thestreet.com/investing/technology/iphone-11-pro-teardowns-look-encouraging-for-stmicro-sony-15105767"
    },
    {
        "category": "company news",
        "datetime": 1569526180,
        "headline": "Walmart Headline 7",
        "id": 25341,
        "image": "http://s.thestreet.com/files/tsc/v2008/photos/contrib/uploads/ba140938-d409-11e9-822b-fda891ce1fc1.png",
        "related": "AAPL",
        "source": "Walmart Source 3",
        "summary": "STMicroelectronics and Sony each appear to be supplying four chips for Apple's latest flagship iPhones. Many other historical iPhone suppliers also make appearances in the latest teardowns….STM",
        "url": "https://realmoney.thestreet.com/investing/technology/iphone-11-pro-teardowns-look-encouraging-for-stmicro-sony-15105767"
    },
    {
        "category": "company news",
        "datetime": 1569526180,
        "headline": "Walmart Headline 8",
        "id": 25341,
        "image": "http://s.thestreet.com/files/tsc/v2008/photos/contrib/uploads/ba140938-d409-11e9-822b-fda891ce1fc1.png",
        "related": "AAPL",
        "source": "Walmart Source 3",
        "summary": "STMicroelectronics and Sony each appear to be supplying four chips for Apple's latest flagship iPhones. Many other historical iPhone suppliers also make appearances in the latest teardowns….STM",
        "url": "https://realmoney.thestreet.com/investing/technology/iphone-11-pro-teardowns-look-encouraging-for-stmicro-sony-15105767"
    },
    {
        "category": "company news",
        "datetime": 1569526180,
        "headline": "Walmart Headline 9",
        "id": 25341,
        "image": "http://s.thestreet.com/files/tsc/v2008/photos/contrib/uploads/ba140938-d409-11e9-822b-fda891ce1fc1.png",
        "related": "AAPL",
        "source": "Walmart Source 9",
        "summary": "STMicroelectronics and Sony each appear to be supplying four chips for Apple's latest flagship iPhones. Many other historical iPhone suppliers also make appearances in the latest teardowns….STM",
        "url": "https://realmoney.thestreet.com/investing/technology/iphone-11-pro-teardowns-look-encouraging-for-stmicro-sony-15105767"
    },
    {
        "category": "company news",
        "datetime": 1569526180,
        "headline": "Walmart Headline 10",
        "id": 25341,
        "image": "http://s.thestreet.com/files/tsc/v2008/photos/contrib/uploads/ba140938-d409-11e9-822b-fda891ce1fc1.png",
        "related": "AAPL",
        "source": "Walmart Source 10",
        "summary": "STMicroelectronics and Sony each appear to be supplying four chips for Apple's latest flagship iPhones. Many other historical iPhone suppliers also make appearances in the latest teardowns….STM",
        "url": "https://realmoney.thestreet.com/investing/technology/iphone-11-pro-teardowns-look-encouraging-for-stmicro-sony-15105767"
    },
    {
        "category": "company news",
        "datetime": 1569526180,
        "headline": "Walmart Headline 11",
        "id": 25341,
        "image": "http://s.thestreet.com/files/tsc/v2008/photos/contrib/uploads/ba140938-d409-11e9-822b-fda891ce1fc1.png",
        "related": "AAPL",
        "source": "Walmart Source 11",
        "summary": "STMicroelectronics and Sony each appear to be supplying four chips for Apple's latest flagship iPhones. Many other historical iPhone suppliers also make appearances in the latest teardowns….STM",
        "url": "https://realmoney.thestreet.com/investing/technology/iphone-11-pro-teardowns-look-encouraging-for-stmicro-sony-15105767"
    },
    {
        "category": "company news",
        "datetime": 1569526180,
        "headline": "Walmart Headline 12",
        "id": 25341,
        "image": "http://s.thestreet.com/files/tsc/v2008/photos/contrib/uploads/ba140938-d409-11e9-822b-fda891ce1fc1.png",
        "related": "AAPL",
        "source": "Walmart Source 12",
        "summary": "STMicroelectronics and Sony each appear to be supplying four chips for Apple's latest flagship iPhones. Many other historical iPhone suppliers also make appearances in the latest teardowns….STM",
        "url": "https://realmoney.thestreet.com/investing/technology/iphone-11-pro-teardowns-look-encouraging-for-stmicro-sony-15105767"
    },
]

const resData_COST = [
    {
        "category": "company news",
        "datetime": 1569550360,
        "headline": "Costco Headline 1",
        "id": 25286,
        "image": "https://img.etimg.com/thumb/msid-71321314,width-1070,height-580,imgsize-481831,overlay-economictimes/photo.jpg",
        "related": "AAPL",
        "source": "Costco Source 1",
        "summary": "NEW DELHI | CHENNAI: India may have to offer electronic manufacturers additional sops such as cheap credit and incentives for export along with infrastructure support in order to boost production and help the sector compete with China, Vietnam and Thailand, according to a top government official.These incentives, over and above the proposed reduction of corporate tax to 15% for new manufacturing units, are vital for India to successfully attract companies looking to relocate manufacturing facilities.“While the tax announcements made last week send a very good signal, in order to help attract investments, we will need additional initiatives,” the official told ET, pointing out that Indian electronic manufacturers incur 8-10% higher costs compared with other Asian countries.Sops that are similar to the incentives for export under the existing Merchandise Exports from India Scheme (MEIS) are what the industry requires, the person said.MEIS gives tax credit in the range of 2-5%. An interest subvention scheme for cheaper loans and a credit guarantee scheme for plant and machinery are some other possible measures that will help the industry, the official added.“This should be 2.0 (second) version of the electronic manufacturing cluster (EMC) scheme, which is aimed at creating an ecosystem with an anchor company plus its suppliers to operate in the same area,” he said.Last week, finance minister Nirmala Sitharaman announced a series of measures to boost economic growth including a scheme allowing any new manufacturing company incorporated on or after October 1, to pay income tax at 15% provided the company does not avail of any other exemption or incentives.",
        "url": "https://economictimes.indiatimes.com/industry/cons-products/electronics/more-sops-needed-to-boost-electronic-manufacturing-top-govt-official/articleshow/71321308.cms"
    },
    {
        "category": "company news",
        "datetime": 1569528720,
        "headline": "Costco Headline 2",
        "id": 25287,
        "image": "https://amp.businessinsider.com/images/5d8d16182e22af6ab66c09e9-1536-768.jpg",
        "related": "AAPL",
        "source": "Costco Source 2",
        "summary": "You can disable comments on your own YouTube video if you don't want people to comment on it. It's easy to disable comments on YouTube by adjusting the settings for one of your videos in the beta or classic version of YouTube Studio. Visit Business Insider's homepage for more stories . The comments section has a somewhat complicated reputation for creators, especially for those making videos on YouTube . While it can be useful to get the unfiltered opinions of your YouTube viewers and possibly forge a closer connection with them, it can also open you up to quite a bit of negativity. So it makes sense that there may be times when you want to turn off the feature entirely. Just keep in mind that the action itself can spark conversation. If you decide that you don't want to let people leave comments on your YouTube video, here's how to turn off the feature, using either the classic or beta version of the creator studio: How to disable comments on YouTube in YouTube Studio (beta) 1. Go to youtube.com and log into your account, if necessary. 2.",
        "url": "https://www.businessinsider.com/how-to-disable-comments-on-youtube"
    },
    {
        "category": "company news",
        "datetime": 1569526180,
        "headline": "Costco Headline 3",
        "id": 25341,
        "image": "http://s.thestreet.com/files/tsc/v2008/photos/contrib/uploads/ba140938-d409-11e9-822b-fda891ce1fc1.png",
        "related": "AAPL",
        "source": "Costco Source 3",
        "summary": "STMicroelectronics and Sony each appear to be supplying four chips for Apple's latest flagship iPhones. Many other historical iPhone suppliers also make appearances in the latest teardowns….STM",
        "url": "https://realmoney.thestreet.com/investing/technology/iphone-11-pro-teardowns-look-encouraging-for-stmicro-sony-15105767"
    },
]

export const mockFinnHubData = //MOCK API REQUEST FOR THIS WIDGET. Remember to update api string on next line.
    rest.get("https://finnhub.io/api/v1/company-news*", (req, res, ctx) => {
        const symbol = req.url.searchParams.get('symbol')
        let resData = symbol === 'WMT' ? resData_WMT : resData_COST
        return res(
            ctx.status(200),
            ctx.json(resData)
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
                exchangelist: 'US,AS',
                defaultexchange: 'US'
            })
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
const resData_WMT_toggle = [
    {
        "category": "company news",
        "datetime": 1569550360,
        "headline": "tWalmart Headline 1",
        "id": 25286,
        "image": "https://img.etimg.com/thumb/msid-71321314,width-1070,height-580,imgsize-481831,overlay-economictimes/photo.jpg",
        "related": "AAPL",
        "source": "tWalmart Source 1",
        "summary": "NEW DELHI | CHENNAI: India may have to offer electronic manufacturers additional sops such as cheap credit and incentives for export along with infrastructure support in order to boost production and help the sector compete with China, Vietnam and Thailand, according to a top government official.These incentives, over and above the proposed reduction of corporate tax to 15% for new manufacturing units, are vital for India to successfully attract companies looking to relocate manufacturing facilities.“While the tax announcements made last week send a very good signal, in order to help attract investments, we will need additional initiatives,” the official told ET, pointing out that Indian electronic manufacturers incur 8-10% higher costs compared with other Asian countries.Sops that are similar to the incentives for export under the existing Merchandise Exports from India Scheme (MEIS) are what the industry requires, the person said.MEIS gives tax credit in the range of 2-5%. An interest subvention scheme for cheaper loans and a credit guarantee scheme for plant and machinery are some other possible measures that will help the industry, the official added.“This should be 2.0 (second) version of the electronic manufacturing cluster (EMC) scheme, which is aimed at creating an ecosystem with an anchor company plus its suppliers to operate in the same area,” he said.Last week, finance minister Nirmala Sitharaman announced a series of measures to boost economic growth including a scheme allowing any new manufacturing company incorporated on or after October 1, to pay income tax at 15% provided the company does not avail of any other exemption or incentives.",
        "url": "https://economictimes.indiatimes.com/industry/cons-products/electronics/more-sops-needed-to-boost-electronic-manufacturing-top-govt-official/articleshow/71321308.cms"
    },
    {
        "category": "company news",
        "datetime": 1569528720,
        "headline": "tWalmart Headline 2",
        "id": 25287,
        "image": "https://amp.businessinsider.com/images/5d8d16182e22af6ab66c09e9-1536-768.jpg",
        "related": "AAPL",
        "source": "Walmart Source 2",
        "summary": "You can disable comments on your own YouTube video if you don't want people to comment on it. It's easy to disable comments on YouTube by adjusting the settings for one of your videos in the beta or classic version of YouTube Studio. Visit Business Insider's homepage for more stories . The comments section has a somewhat complicated reputation for creators, especially for those making videos on YouTube . While it can be useful to get the unfiltered opinions of your YouTube viewers and possibly forge a closer connection with them, it can also open you up to quite a bit of negativity. So it makes sense that there may be times when you want to turn off the feature entirely. Just keep in mind that the action itself can spark conversation. If you decide that you don't want to let people leave comments on your YouTube video, here's how to turn off the feature, using either the classic or beta version of the creator studio: How to disable comments on YouTube in YouTube Studio (beta) 1. Go to youtube.com and log into your account, if necessary. 2.",
        "url": "https://www.businessinsider.com/how-to-disable-comments-on-youtube"
    },
    {
        "category": "company news",
        "datetime": 1569526180,
        "headline": "tWalmart Headline 3",
        "id": 25341,
        "image": "http://s.thestreet.com/files/tsc/v2008/photos/contrib/uploads/ba140938-d409-11e9-822b-fda891ce1fc1.png",
        "related": "AAPL",
        "source": "tWalmart Source 3",
        "summary": "STMicroelectronics and Sony each appear to be supplying four chips for Apple's latest flagship iPhones. Many other historical iPhone suppliers also make appearances in the latest teardowns….STM",
        "url": "https://realmoney.thestreet.com/investing/technology/iphone-11-pro-teardowns-look-encouraging-for-stmicro-sony-15105767"
    },
]


const resData_COST_toggle = [
    {
        "category": "company news",
        "datetime": 1569550360,
        "headline": "tCostco Headline 1",
        "id": 25286,
        "image": "https://img.etimg.com/thumb/msid-71321314,width-1070,height-580,imgsize-481831,overlay-economictimes/photo.jpg",
        "related": "AAPL",
        "source": "tCostco Source 1",
        "summary": "NEW DELHI | CHENNAI: India may have to offer electronic manufacturers additional sops such as cheap credit and incentives for export along with infrastructure support in order to boost production and help the sector compete with China, Vietnam and Thailand, according to a top government official.These incentives, over and above the proposed reduction of corporate tax to 15% for new manufacturing units, are vital for India to successfully attract companies looking to relocate manufacturing facilities.“While the tax announcements made last week send a very good signal, in order to help attract investments, we will need additional initiatives,” the official told ET, pointing out that Indian electronic manufacturers incur 8-10% higher costs compared with other Asian countries.Sops that are similar to the incentives for export under the existing Merchandise Exports from India Scheme (MEIS) are what the industry requires, the person said.MEIS gives tax credit in the range of 2-5%. An interest subvention scheme for cheaper loans and a credit guarantee scheme for plant and machinery are some other possible measures that will help the industry, the official added.“This should be 2.0 (second) version of the electronic manufacturing cluster (EMC) scheme, which is aimed at creating an ecosystem with an anchor company plus its suppliers to operate in the same area,” he said.Last week, finance minister Nirmala Sitharaman announced a series of measures to boost economic growth including a scheme allowing any new manufacturing company incorporated on or after October 1, to pay income tax at 15% provided the company does not avail of any other exemption or incentives.",
        "url": "https://economictimes.indiatimes.com/industry/cons-products/electronics/more-sops-needed-to-boost-electronic-manufacturing-top-govt-official/articleshow/71321308.cms"
    },
    {
        "category": "company news",
        "datetime": 1569528720,
        "headline": "tCostco Headline 2",
        "id": 25287,
        "image": "https://amp.businessinsider.com/images/5d8d16182e22af6ab66c09e9-1536-768.jpg",
        "related": "AAPL",
        "source": "tCostco Source 2",
        "summary": "You can disable comments on your own YouTube video if you don't want people to comment on it. It's easy to disable comments on YouTube by adjusting the settings for one of your videos in the beta or classic version of YouTube Studio. Visit Business Insider's homepage for more stories . The comments section has a somewhat complicated reputation for creators, especially for those making videos on YouTube . While it can be useful to get the unfiltered opinions of your YouTube viewers and possibly forge a closer connection with them, it can also open you up to quite a bit of negativity. So it makes sense that there may be times when you want to turn off the feature entirely. Just keep in mind that the action itself can spark conversation. If you decide that you don't want to let people leave comments on your YouTube video, here's how to turn off the feature, using either the classic or beta version of the creator studio: How to disable comments on YouTube in YouTube Studio (beta) 1. Go to youtube.com and log into your account, if necessary. 2.",
        "url": "https://www.businessinsider.com/how-to-disable-comments-on-youtube"
    },
    {
        "category": "company news",
        "datetime": 1569526180,
        "headline": "tCostco Headline 3",
        "id": 25341,
        "image": "http://s.thestreet.com/files/tsc/v2008/photos/contrib/uploads/ba140938-d409-11e9-822b-fda891ce1fc1.png",
        "related": "AAPL",
        "source": "tCostco Source 3",
        "summary": "STMicroelectronics and Sony each appear to be supplying four chips for Apple's latest flagship iPhones. Many other historical iPhone suppliers also make appearances in the latest teardowns….STM",
        "url": "https://realmoney.thestreet.com/investing/technology/iphone-11-pro-teardowns-look-encouraging-for-stmicro-sony-15105767"
    },
]

export const mockFinnHubData_toggle = //MOCK API REQUEST FOR THIS WIDGET. Remember to update api string on next line.
    rest.get("https://finnhub.io/api/v1/company-news*", (req, res, ctx) => {
        // console.log('RETURN TOGGLE DATA')
        const symbol = req.url.searchParams.get('symbol')
        let resData = symbol === 'WMT' ? resData_WMT_toggle : resData_COST_toggle
        return res(
            ctx.status(200),
            ctx.json(resData)
        )
    })
