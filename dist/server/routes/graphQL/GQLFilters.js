//import all API string generator functions here and register below to widgetDict.
import basicFinancialsGQLFilter from "./filters/basicFinancialsGQLFIlters.js";
import companyNewsGQLFilter from "./filters/companyNewsGQLFilter.js";
import recommendationTrendsGQLFilter from "./filters/recommendationTrendsGQLFilter.js";
import EPSSuprisesGQLFilter from "./filters/EPSSurprisesGQLFilter.js";
import EarningsCalendarGQLFilter from "./filters/earningsCalendarGQLFilter.js";
import marketNewsGQLFilter from "./filters/marketNewsGQLFilters.js";
import peersGQLFilter from "./filters/peersGQLFilter.js";
import secFilingsGQLFilter from "./filters/secFilingsGQLFilters.js";
import priceSplitsGQLFilter from "./filters/priceSplitsGQLFilters.js";
export const filterDict = {
    // PriceCandles: candleWidgetGQLFilter,
    // PriceQuote: quoteWidgetGQLFilter,
    PriceSplits: priceSplitsGQLFilter,
    FundamentalsBasicFinancials: basicFinancialsGQLFilter,
    FundamentalsCompanyNews: companyNewsGQLFilter,
    // FundamentalsCompanyProfile2: companyProfileGQLFilter,
    FundamentalsMarketNews: marketNewsGQLFilter,
    // FundamentalsNewsSentiment: newsSentimentGQLFilter,
    FundamentalsPeers: peersGQLFilter,
    // FundamentalsFinancialsAsReported: financialsAsReportedGQLFilter,
    FundamentalsSECFilings: secFilingsGQLFilter,
    // FundamentalsIPOCalendar: IPOCalendarGQLFilter,
    EstimatesRecommendationTrends: recommendationTrendsGQLFilter,
    // EstimatesPriceTarget: priceTargetGQLFilter,
    EstimatesEPSSurprises: EPSSuprisesGQLFilter,
    EstimatesEarningsCalendar: EarningsCalendarGQLFilter,
};
//# sourceMappingURL=GQLFilters.js.map