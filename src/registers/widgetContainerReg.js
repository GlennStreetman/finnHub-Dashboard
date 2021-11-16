//import widget and menu objects here and then add to widgetlookup below.
import DashBoardMenu from "../widgets/Menu/dashBoardMenu/dashBoardMenu";
import WatchListMenu from "../widgets/Menu/watchListMenu/watchListMenu";
import GQLMenu from '../widgets/Menu/GQLMenu/GQLMenu'

import EstimatesRecommendationTrends from "../widgets/Estimates/RecommendationTrends/recommendationTrendsBody";
import EstimatesPriceTarget from "../widgets/Estimates/PriceTarget/priceTargetBody";
import EstimatesEPSSurprises from "../widgets/Estimates/EPSSurprises/EPSSurpsisesBody";
import EstimatesEarningsCalendar from "../widgets/Estimates/EarningsCalendar/EarningsCalendarBody";

import FundamentalsCompanyNews from "../widgets/Fundamentals/companyNews/companyNewsBody";
import FundamentalsBasicFinancials from "../widgets/Fundamentals/basicFinancials/basicFinancialsBody";
import FundamentalsCompanyProfile2 from "../widgets/Fundamentals/companyProfile2/companyProfile2Body";
import FundamentalsMarketNews from "../widgets/Fundamentals/marketNews/marketNewsBody";
import FundamentalsNewsSentiment from "../widgets/Fundamentals/newsSentiment/newsSentimentBody";
import FundamentalsPeers from "../widgets/Fundamentals/Peers/peersBody";
import FundamentalsFinancialsAsReported from "../widgets/Fundamentals/financialsAsReported/financialsAsReportedBody";
import FundamentalsSECFilings from "../widgets/Fundamentals/secFilings/secFilingsBody";
import FundamentalsIPOCalendar from "../widgets/Fundamentals/IPOCalendar/IPOCalendarBody";

import PriceQuote from "../widgets/Price/quote/quoteBody";
import PriceCandles from "../widgets/Price/candles/candleWidget"; //fix names
import PriceSplits from "../widgets/Price/splits/PriceSplitsBody";


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
    GQLMenu: GQLMenu,
}; 

