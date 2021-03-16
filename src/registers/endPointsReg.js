//import all API string generator functions here and register below to widgetDict.
const candleWidgetEndPoint = require("../widgets/Price/candles/candlesEndPoint");
const quoteWidgetEndPoint = require("../widgets/Price/quote/quoteEndPoint");
const priceSplitsEndPoint = require("../widgets/Price/splits/priceSplitsEndPoint");
const basicFinancialsEndPoint = require("../widgets/Fundamentals/basicFinancials/basicFinancialsEndPoint");
const companyNewsEndPoint = require("../widgets/Fundamentals/companyNews/companyNewsEndPoint");
const companyProfileEndPoint = require("../widgets/Fundamentals/companyProfile2/companyProfile2EndPoint");
const marketNewsEndPoint = require("../widgets/Fundamentals/marketNews/marketNewsEndPoint");
const newsSentimentEndPoint = require("../widgets/Fundamentals/newsSentiment/newsSentimentEndPoint");
const peersEndPoint = require("../widgets/Fundamentals/Peers/peersEndPoint");
const financialsAsReportedEndPoint = require("../widgets/Fundamentals/financialsAsReported/financialsAsReportedEndPoint");
const secFilingsEndPoint = require("../widgets/Fundamentals/secFilings/secFilingsEndPoint");
const IPOCalendarEndPoint = require("../widgets/Fundamentals/IPOCalendar/IPOCalendarEndPoint")
const recommendationTrendsEndPoint = require("../widgets/Estimates/RecommendationTrends/RecommendationTrendsEndPoint")
const priceTargetEndPoint = require("../widgets/Estimates/PriceTarget/priceTargetEndPoint")
const EPSSuprisesEndPoint = require("../widgets/Estimates/EPSSurprises/EPSSurprisesEndPoint")
const EarningsCalendarEndPoint = require("../widgets/Estimates/EarningsCalendar/EarningsCalendarEndPoint")

const widgetDict = {
    PriceCandles: candleWidgetEndPoint,
    PriceQuote: quoteWidgetEndPoint,
    PriceSplits: priceSplitsEndPoint,
    FundamentalsBasicFinancials: basicFinancialsEndPoint,
    FundamentalsCompanyNews: companyNewsEndPoint,
    FundamentalsCompanyProfile2: companyProfileEndPoint,
    FundamentalsMarketNews: marketNewsEndPoint,
    FundamentalsNewsSentiment: newsSentimentEndPoint,
    FundamentalsPeers: peersEndPoint,
    FundamentalsFinancialsAsReported: financialsAsReportedEndPoint,
    FundamentalsSECFilings: secFilingsEndPoint,
    FundamentalsIPOCalendar: IPOCalendarEndPoint,
    EstimatesRecommendationTrends: recommendationTrendsEndPoint,
    EstimatesPriceTarget: priceTargetEndPoint,
    EstimatesEPSSurprises: EPSSuprisesEndPoint,
    EstimatesEarningsCalendar: EarningsCalendarEndPoint,
}

module.exports.widgetDict = widgetDict