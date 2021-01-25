//import widget and menu objects here and then add to widgetlookup below.
import DashBoardMenu from "../widgets/Menu/dashBoardMenu/dashBoardMenu.js";
import WatchListMenu from "../widgets/Menu/watchListMenu/watchListMenu.js";

import EstimatesRecommendationTrends from "../widgets/Estimates/RecommendationTrends/recommendationTrendsBody.js";
import EstimatesPriceTarget from "../widgets/Estimates/PriceTarget/priceTargetBody.js";
import EstimatesEPSSurprises from "../widgets/Estimates/EPSSurprises/EPSSurpsisesBody.js";
import EstimatesEarningsCalendar from "../widgets/Estimates/EarningsCalendar/EarningsCalendarBody.js";

import FundamentalsCompanyNews from "../widgets/Fundamentals/companyNews/companyNewsBody.js";
import FundamentalsBasicFinancials from "../widgets/Fundamentals/basicFinancials/basicFinancialsBody.js";
import FundamentalsCompanyProfile2 from "../widgets/Fundamentals/companyProfile2/companyProfile2Body.js";
import FundamentalsMarketNews from "../widgets/Fundamentals/marketNews/marketNewsBody.js";
import FundamentalsNewsSentiment from "../widgets/Fundamentals/newsSentiment/newsSentimentBody.js";
import FundamentalsPeers from "../widgets/Fundamentals/Peers/peersBody.js";
import FundamentalsFinancialsAsReported from "../widgets/Fundamentals/financialsAsReported/financialsAsReportedBody.js";
import FundamentalsSECFilings from "../widgets/Fundamentals/secFilings/secFilingsBody.js";
import FundamentalsIPOCalendar from "../widgets/Fundamentals/IPOCalendar/IPOCalendarBody.js";

import PriceQuote from "../widgets/Price/quote/quoteBody.js";
import PriceCandles from "../widgets/Price/candles/candleWidget.js"; //fix names
import PriceSplits from "../widgets/Price/splits/PriceSplitsBody.js";

export let widgetLookUp = {
    EstimatesRecommendationTrends: EstimatesRecommendationTrends,
    EstimatesPriceTarget: EstimatesPriceTarget,
    EstimatesEPSSurprises: EstimatesEPSSurprises,
    EstimatesEarningsCalendar: EstimatesEarningsCalendar,
    FundamentalsCompanyNews: FundamentalsCompanyNews,
    FundamentalsBasicFinancials: FundamentalsBasicFinancials,
    FundamentalsCompanyProfile2: FundamentalsCompanyProfile2,
    FundamentalsMarketNews: FundamentalsMarketNews,
    FundamentalsNewsSentiment: FundamentalsNewsSentiment,
    FundamentalsPeers: FundamentalsPeers,
    FundamentalsFinancialsAsReported: FundamentalsFinancialsAsReported,
    FundamentalsSECFilings: FundamentalsSECFilings,
    FundamentalsIPOCalendar: FundamentalsIPOCalendar,
    PriceQuote: PriceQuote,
    PriceCandles: PriceCandles,
    PriceSplits:PriceSplits,
    DashBoardMenu: DashBoardMenu,
    WatchListMenu: WatchListMenu,
}; 

