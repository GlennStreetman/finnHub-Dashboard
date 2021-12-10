//dropdown menu: widget Object, Widget default name, family, Dropdown list description
//imported by topNav component.
/* eslint-disable no-sparse-arrays*/
import { filters } from './../App'
import { candleWidgetFilters } from '../widgets/Price/candles/candleWidget';
import { priceSplitsFilters } from '../widgets/Price/splits/PriceSplitsBody';
import { EarningsCalendarFilters } from '../widgets/Estimates/EarningsCalendar/EarningsCalendarBody';
import { companyNewsFilters } from '../widgets/Fundamentals/companyNews/companyNewsBody';
import { IPOCalendarFilters } from '../widgets/Fundamentals/IPOCalendar/IPOCalendarBody';
import { marketNewsFilters } from '../widgets/Fundamentals/marketNews/marketNewsBody';
import { financialsAsReportedFilters } from '../widgets/Fundamentals/financialsAsReported/financialsAsReportedBody'

//1.widget Type, 2.Widget Name, 3.widget class, 4.widget Name?, 5.filters(optional), 6.api tier[free,hybird,premium]
export let estimateOptions: [string, string, string, string, filters | undefined, string][] = [
    ["EstimatesEarningsCalendar", "Earnings Calendar", "stockWidget", "Earnings Calendar", EarningsCalendarFilters, 'Free'],
    ["EstimatesEPSSurprises", "EPS Surprises", "stockWidget", "EPS Surprises", , 'Free'],
    ["EstimatesPriceTarget", "Price Target", "stockWidget", "Price Target", , 'Premium'],
    ["EstimatesRecommendationTrends", "Recommendation Trends", "stockWidget", "Recommendation Trends", , 'Free'],
]

export let fundamentalsOptions: [string, string, string, string, filters | undefined, string][] = [
    ["FundamentalsBasicFinancials", "Basic Financials", "stockWidget", "Basic Financials", , 'Free'],
    ["FundamentalsCompanyProfile2", "Profile 2", "stockWidget", "Company Profile 2", , 'Free'],
    ["FundamentalsCompanyNews", "Company News", "stockWidget", "Company News", companyNewsFilters, 'Free'],
    ["FundamentalsFinancialsAsReported", "Financials As Reported", "stockWidget", "Fin. As Reported", financialsAsReportedFilters, 'Free'],
    ["FundamentalsIPOCalendar", "IPO Calendar", "marketWidget", "IPO Calendar", IPOCalendarFilters, 'Free'],
    ["FundamentalsMarketNews", "Market News", "marketWidget", "Market News", marketNewsFilters, 'Free'],
    ["FundamentalsNewsSentiment", "News Sentiment", "stockWidget", "News Sentiments", , 'Free'],
    ["FundamentalsPeers", "Peers", "stockWidget", "Peers", , 'Free'],
    ["FundamentalsSECFilings", "SEC Filings", "stockWidget", "SEC Filings", , 'Free'],
]

export let priceOptions: [string, string, string, string, filters | undefined, string][] = [
    ["PriceCandles", "Price Candle", "stockWidget", "Candles", candleWidgetFilters, 'Free'],
    ["PriceQuote", "Price Quote", "stockWidget", "Quote", , 'Free'],
    ["PriceSplits", "Price Split", "stockWidget", "Splits", priceSplitsFilters, 'Premium'],
]

export const widgetDescriptions = {
    EstimatesEarningsCalendar: "Get historical and coming earnings release. EPS & Revenue, Non GAAP.",
    EstimatesEPSSurprises: "Get company historical quarterly earnings surprise going back to 2000.",
    EstimatesPriceTarget: "Get latest price target consensus.",
    EstimatesRecommendationTrends: "Get latest analyst recommendation trends for a company.",
    FundamentalsBasicFinancials: "Get company basic financials such as margin, P/E ratio, 52-week high/low etc.",
    FundamentalsCompanyNews: "List latest company news by symbol. This endpoint is only available for North American companies.",
    FundamentalsCompanyProfile2: "Get general information of a company. You can query by symbol, ISIN or CUSIP. This is the free version of Company Profile.",
    FundamentalsFinancialsAsReported: "Get financials as reported. This data is available for bulk download on Kaggle SEC Financials database.",
    FundamentalsIPOCalendar: "Get recent and upcoming IPO.",
    FundamentalsMarketNews: "Get latest market news.",
    FundamentalsNewsSentiment: "Get company's news sentiment and statistics. This endpoint is only available for US companies.",
    FundamentalsPeers: "Get company peers. Return a list of peers in the same country and sub-industry.",
    FundamentalsSECFilings: "List company's filing. Limit to 250 documents at a time. This data is available for bulk download on Kaggle SEC Filings database.",
    PriceCandles: "Get candlestick data (OHLCV) for stocks.",
    PriceQuote: "Get real-time quote data for US stocks.",
    PriceSplits: "Get splits data for stocks.",
}
