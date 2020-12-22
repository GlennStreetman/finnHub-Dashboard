
//import widget and menu objects here and then add to widgetlookup below.
import PriceQuote from "../widgets/Price/quote/stockDetailWidget.js";
import PriceCandles from "../widgets/Price/candles/candleWidget.js";

import FundamentalsCompanyNews from "../widgets/Fundamentals/companyNews/companyNewsBody.js";
import FundamentalsBasicFinancials from "../widgets/Fundamentals/basicFinancials/basicFinancialsBody.js";
import FundamentalsCompanyProfile2 from "../widgets/Fundamentals/companyProfile2/companyProfile2Body.js";
import FundamentalsMarketNews from "../widgets/Fundamentals/marketNews/marketNewsBody.js";

import DashBoardMenu from "../widgets/Menu/dashBoardMenu/dashBoardMenu.js";
import WatchListMenu from "../widgets/Menu/watchListMenu/watchListMenu.js";

export let widgetLookUp = {
    FundamentalsCompanyNews: FundamentalsCompanyNews,
    FundamentalsBasicFinancials: FundamentalsBasicFinancials,
    FundamentalsCompanyProfile2: FundamentalsCompanyProfile2,
    FundamentalsMarketNews: FundamentalsMarketNews,
    PriceQuote: PriceQuote,
    PriceCandles: PriceCandles,
    DashBoardMenu: DashBoardMenu,
    WatchListMenu: WatchListMenu,
}; 

