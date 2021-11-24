// import all API string generator functions here and register below to widgetDict.
import candleWidgetEndPoint from "../widgets/Price/candles/candlesEndPoint";
// import quoteWidgetEndPoint from "../widgets/Price/quote/quoteEndPoint";
// import priceSplitsEndPoint from "../widgets/Price/splits/priceSplitsEndPoint";
// import basicFinancialsEndPoint from "../widgets/Fundamentals/basicFinancials/basicFinancialsEndPoint";
// import companyNewsEndPoint from "../widgets/Fundamentals/companyNews/companyNewsEndPoint";
// import companyProfileEndPoint from "../widgets/Fundamentals/companyProfile2/companyProfile2EndPoint";
// import marketNewsEndPoint from "../widgets/Fundamentals/marketNews/marketNewsEndPoint";
// import newsSentimentEndPoint from "../widgets/Fundamentals/newsSentiment/newsSentimentEndPoint";
// import peersEndPoint from "../widgets/Fundamentals/Peers/peersEndPoint";
// import financialsAsReportedEndPoint from "../widgets/Fundamentals/financialsAsReported/financialsAsReportedEndPoint";
// import secFilingsEndPoint from "../widgets/Fundamentals/secFilings/secFilingsEndPoint";
// import IPOCalendarEndPoint from "../widgets/Fundamentals/IPOCalendar/IPOCalendarEndPoint";
// import recommendationTrendsEndPoint from "../widgets/Estimates/RecommendationTrends/RecommendationTrendsEndPoint";
// import priceTargetEndPoint from "../widgets/Estimates/PriceTarget/priceTargetEndPoint";
// import EPSSuprisesEndPoint from "../widgets/Estimates/EPSSurprises/EPSSurprisesEndPoint";
// import EarningsCalendarEndPoint from "../widgets/Estimates/EarningsCalendar/EarningsCalendarEndPoint";

interface widgetDictInt {
    [key: string]: Function
}

export const buildVisable: widgetDictInt = {
    // PriceCandles: candleWidgetEndPoint,
    // PriceQuote: quoteWidgetEndPoint,
    // PriceSplits: priceSplitsEndPoint,
    // FundamentalsBasicFinancials: basicFinancialsEndPoint,
    // FundamentalsCompanyNews: companyNewsEndPoint,
    // FundamentalsCompanyProfile2: companyProfileEndPoint,
    // FundamentalsMarketNews: marketNewsEndPoint,
    // FundamentalsNewsSentiment: newsSentimentEndPoint,
    // FundamentalsPeers: peersEndPoint,
    // FundamentalsFinancialsAsReported: financialsAsReportedEndPoint,
    // FundamentalsSECFilings: secFilingsEndPoint,
    // FundamentalsIPOCalendar: IPOCalendarEndPoint,
    // EstimatesRecommendationTrends: recommendationTrendsEndPoint,
    // EstimatesPriceTarget: priceTargetEndPoint,
    // EstimatesEPSSurprises: EPSSuprisesEndPoint,
    // EstimatesEarningsCalendar: EarningsCalendarEndPoint,
}
