//import all API string generator functions here and register below to widgetDict.
// import candleWidgetEndPoint  from "../widgets/Price/candles/candlesEndPoint";
// import quoteWidgetEndPoint  from "../widgets/Price/quote/quoteEndPoint";
// import priceSplitsEndPoint  from "../widgets/Price/splits/priceSplitsEndPoint";
import basicFinancialsEndPoint from "./filters/basicFinancialsGQLFIlters.js";
// import companyNewsEndPoint  from "../widgets/Fundamentals/companyNews/companyNewsEndPoint";
// import companyProfileEndPoint  from "../widgets/Fundamentals/companyProfile2/companyProfile2EndPoint";
// import marketNewsEndPoint  from "../widgets/Fundamentals/marketNews/marketNewsEndPoint";
// import newsSentimentEndPoint  from "../widgets/Fundamentals/newsSentiment/newsSentimentEndPoint";
// import peersEndPoint  from "../widgets/Fundamentals/Peers/peersEndPoint";
// import financialsAsReportedEndPoint  from "../widgets/Fundamentals/financialsAsReported/financialsAsReportedEndPoint";
// import secFilingsEndPoint  from "../widgets/Fundamentals/secFilings/secFilingsEndPoint";
// import IPOCalendarEndPoint  from "../widgets/Fundamentals/IPOCalendar/IPOCalendarEndPoint";
import recommendationTrendsGQLFilter from "./filters/recommendationTrendsGQLFilter.js";
// import priceTargetEndPoint  from "../widgets/Estimates/PriceTarget/priceTargetEndPoint";
import EPSSuprisesEndPoint from "./filters/EPSSurprisesGQLFilter.js";
import EarningsCalendarEndPoint from "./filters/earningsCalendarGQLFilter.js";
export const filterDict = {
    // PriceCandles: candleWidgetEndPoint,
    // PriceQuote: quoteWidgetEndPoint,
    // PriceSplits: priceSplitsEndPoint,
    FundamentalsBasicFinancials: basicFinancialsEndPoint,
    // FundamentalsCompanyNews: companyNewsEndPoint,
    // FundamentalsCompanyProfile2: companyProfileEndPoint,
    // FundamentalsMarketNews: marketNewsEndPoint,
    // FundamentalsNewsSentiment: newsSentimentEndPoint,
    // FundamentalsPeers: peersEndPoint,
    // FundamentalsFinancialsAsReported: financialsAsReportedEndPoint,
    // FundamentalsSECFilings: secFilingsEndPoint,
    // FundamentalsIPOCalendar: IPOCalendarEndPoint,
    EstimatesRecommendationTrends: recommendationTrendsGQLFilter,
    // EstimatesPriceTarget: priceTargetEndPoint,
    EstimatesEPSSurprises: EPSSuprisesEndPoint,
    EstimatesEarningsCalendar: EarningsCalendarEndPoint,
};
//# sourceMappingURL=GQLFilters.js.map