//import all API string generator functions here and register below to widgetDict.
import basicFinancialsGQLFilter  from "./filters/basicFinancialsGQLFIlters.js";
import companyNewsGQLFilter  from "./filters/companyNewsGQLFilter.js";
import recommendationTrendsGQLFilter  from "./filters/recommendationTrendsGQLFilter.js";
import EPSSuprisesGQLFilter  from "./filters/EPSSurprisesGQLFilter.js";
import EarningsCalendarGQLFilter  from "./filters/earningsCalendarGQLFilter.js";
import marketNewsGQLFilter  from "./filters/marketNewsGQLFilters.js";
import peersGQLFilter  from "./filters/peersGQLFilter.js";
import secFilingsGQLFilter  from "./filters/secFilingsGQLFilters.js";
import priceSplitsGQLFilter  from "./filters/priceSplitsGQLFilters.js";
import financialsAsReportedGQLFilter from './filters/financialsAsReportedGQLFilters.js'
import ipoCalendarGQLFilter from './filters/ipoCalendarGQLFilters.js'
import newsSentimentGQLFilter from './filters/newsSentimentGQLFilters.js'

export const filterDict = { //Remember to convert time series data into an object list, time value should be key.
    // PriceCandles: candleWidgetGQLFilter,
    // PriceQuote: quoteWidgetGQLFilter,
    PriceSplits: priceSplitsGQLFilter,
    FundamentalsBasicFinancials: basicFinancialsGQLFilter,
    FundamentalsCompanyNews: companyNewsGQLFilter,
    // FundamentalsCompanyProfile2: companyProfileGQLFilter,
    FundamentalsMarketNews: marketNewsGQLFilter,
    FundamentalsNewsSentiment: newsSentimentGQLFilter,
    FundamentalsPeers: peersGQLFilter,
    FundamentalsFinancialsAsReported: financialsAsReportedGQLFilter,
    FundamentalsSECFilings: secFilingsGQLFilter,
    FundamentalsIPOCalendar: ipoCalendarGQLFilter,
    EstimatesRecommendationTrends: recommendationTrendsGQLFilter,
    // EstimatesPriceTarget: priceTargetGQLFilter,
    EstimatesEPSSurprises: EPSSuprisesGQLFilter,
    EstimatesEarningsCalendar: EarningsCalendarGQLFilter,
}


