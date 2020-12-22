//import all API string generator functions here and register below to widgetDict.
const candleWidgetEndPoint = require("../widgets/Price/candles/candlesEndPoint.js");
const quoteWidgetEndPoint = require("../widgets/Price/quote/quoteEndPoint.js");
const basicFinancialsEndPoint = require("../widgets/Fundamentals/basicFinancials/basicFinancialsEndPoint.js");
const companyNewsEndPoint = require("../widgets/Fundamentals/companyNews/companyNewsEndPoint.js");
const companyProfileEndPoint = require("../widgets/Fundamentals/companyProfile2/companyProfile2EndPoint.js");
const marketNewsEndPoint = require("../widgets/Fundamentals/marketNews/marketNewsEndPoint.js");

const widgetDict = {
    PriceCandles: candleWidgetEndPoint,
    PriceQuote:quoteWidgetEndPoint,
    FundamentalsBasicFinancials: basicFinancialsEndPoint,
    FundamentalsCompanyNews: companyNewsEndPoint,
    FundamentalsCompanyProfile2: companyProfileEndPoint,
    FundamentalsMarketNews: marketNewsEndPoint,
}

module.exports.widgetDict = widgetDict