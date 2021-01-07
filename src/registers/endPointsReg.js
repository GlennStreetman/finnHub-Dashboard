//import all API string generator functions here and register below to widgetDict.
const candleWidgetEndPoint = require("../widgets/Price/candles/candlesEndPoint.js");
const quoteWidgetEndPoint = require("../widgets/Price/quote/quoteEndPoint.js");
const basicFinancialsEndPoint = require("../widgets/Fundamentals/basicFinancials/basicFinancialsEndPoint.js");
const companyNewsEndPoint = require("../widgets/Fundamentals/companyNews/companyNewsEndPoint.js");
const companyProfileEndPoint = require("../widgets/Fundamentals/companyProfile2/companyProfile2EndPoint.js");
const marketNewsEndPoint = require("../widgets/Fundamentals/marketNews/marketNewsEndPoint.js");
const newsSentimentEndPoint = require("../widgets/Fundamentals/newsSentiment/newsSentimentEndPoint.js");
const peersEndPoint = require("../widgets/Fundamentals/Peers/peersEndPoint.js");
const financialsAsReportedEndPoint = require("../widgets/Fundamentals/financialsAsReported/financialsAsReportedEndPoint.js");
const secFilingsEndPoint = require("../widgets/Fundamentals/secFilings/secFilingsEndPoint.js");
const IPOCalendarEndPoint = require("../widgets/Fundamentals/IPOCalendar/IPOCalendarEndPoint.js")
const recommendationTrendsEndPoint = require("../widgets/Estimates/recommendationTrends/RecommendationTrendsEndPoint.js")
const priceTargetEndPoint = require("../widgets/Estimates/priceTarget/priceTargetEndPoint.js")
const EPSSuprisesEndPoint = require("../widgets/Estimates/EPSSurprises/EPSSurprisesEndPoint.js")
const EarningsCalendarEndPoint = require("../widgets/Estimates/EarningsCalendar/EarningsCalendarEndPoint.js")

const widgetDict = {
    PriceCandles: candleWidgetEndPoint,
    PriceQuote: quoteWidgetEndPoint,
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