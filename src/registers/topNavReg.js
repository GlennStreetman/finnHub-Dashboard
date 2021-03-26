//dropdown menu: widget Object, Widget default name, family, Dropdown list description
//imported by topNav component.
import { candleWidgetFilters } from './../widgets/Price/candles/candleWidget';
import { priceSplitsFilters } from './../widgets/Price/splits/PriceSplitsBody';
import { EarningsCalendarFilters } from './../widgets/Estimates/EarningsCalendar/EarningsCalendarBody';
import { companyNewsFilters } from './../widgets/Fundamentals/companyNews/companyNewsBody';
import { IPOCalendarFilters } from './../widgets/Fundamentals/IPOCalendar/IPOCalendarBody';
import { marketNewsFilters } from './../widgets/Fundamentals/marketNews/marketNewsBody';

export let estimateOptions = [
    ["EstimatesEarningsCalendar" ,"Earnings Calendar: ", "stockWidget", "Earnings Calendar", EarningsCalendarFilters],  
    ["EstimatesEPSSurprises" ,"EPS Surprises: ", "stockWidget", "EPS Surprises"], 
    ["EstimatesPriceTarget" ,"Price Target: ", "stockWidget", "Price Target"], 
    ["EstimatesRecommendationTrends" ,"Recommendation Trends: ", "stockWidget", "Recommendation Trends"], 
]

export let fundamentalsOptions = [  
    ["FundamentalsBasicFinancials", "Basic Financials: ", "stockWidget", "Basic Financials"],
    ["FundamentalsCompanyProfile2","Profile 2:","stockWidget","Company Profile 2"],
    ["FundamentalsCompanyNews", "Company News: ", "stockWidget", "Company News", companyNewsFilters],
    ["FundamentalsFinancialsAsReported", "FinancialsAsReported: ", "stockWidget", "Fin. As Reported"],
    ["FundamentalsIPOCalendar", "IPO Calendar: ", "marketWidget", "IPO Calendar", IPOCalendarFilters],
    ["FundamentalsMarketNews", "Market News: ", "marketWidget", "Market News", marketNewsFilters],
    ["FundamentalsNewsSentiment", "News Sentiment: ", "stockWidget", "News Sentiments"],
    ["FundamentalsPeers", "Peers: ", "stockWidget", "Peers"],
    ["FundamentalsSECFilings", "SEC Filings: ", "stockWidget", "SEC Filings"],
]


export let priceOptions = [
    ["PriceCandles", "Price Candle: ", "stockWidget", "Candles", candleWidgetFilters],
    ["PriceQuote", "Price Quote: ", "stockWidget", "Quote"],
    ["PriceSplits", "Price Split: ", "stockWidget", "Splits", priceSplitsFilters],
] 
