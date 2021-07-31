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
