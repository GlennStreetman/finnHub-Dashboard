//import all API string generator functions here and register below to widgetDict.
const candleWidgetEndPoint = require("../widgets/Price/candles/candlesEndPoint.js");
const quoteWidgetEndPoint = require("../widgets/Price/quote/quoteEndPoint.js");
const basicFinancialsEndPoint = require("../widgets/Fundamentals/basicFinancials/basicFinancialsEndPoint.js");
const marketNewsEndPoint = require("../widgets/Fundamentals/marketNews/marketNewsEndPoint.js");
const companyProfileEndPoint = require("../widgets/Fundamentals/companyProfile2/companyProfile2EndPoint.js");

const widgetDict = {
    PriceCandles: candleWidgetEndPoint,
    PriceQuote:quoteWidgetEndPoint,
    FundamentalsBasicFinancials: basicFinancialsEndPoint,
    FundamentalsCompanyNews: marketNewsEndPoint,
    FundamentalsCompanyProfile2: companyProfileEndPoint,
}

module.exports.widgetDict = widgetDict