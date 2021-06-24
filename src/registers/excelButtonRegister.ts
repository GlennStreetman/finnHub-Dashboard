// import all API string generator functions here and register below to widgetDict.

import { EarningsCalendarExcelFunction } from "../widgets/Estimates/EarningsCalendar/EarningsCalendarExcelFunction";
import { epsSuprisesExcel } from "../widgets/Estimates/EPSSurprises/epsSurprisesExcelFunction";
import { priceTargetExcel } from "../widgets/Estimates/PriceTarget/priceTargetExcelFunction";
import { recTrendExcel } from "../widgets/Estimates/RecommendationTrends/recTrendExcelFunction";

import { basicFinancialsExcel } from "../widgets/Fundamentals/basicFinancials/basicFinancialsExcelFunction";
import { companyNewsExcel } from "../widgets/Fundamentals/companyNews/companyNewsExcelFunction";
import { companyProfileExcel } from "../widgets/Fundamentals/companyProfile2/companyProfileExcelFunction";
import { financialsAsReportedExcel } from "../widgets/Fundamentals/financialsAsReported/financialsAsReportedExcelFunction";
import { ipoCalendarExcel } from "../widgets/Fundamentals/IPOCalendar/IPOCalendarExcelFunction";
import { marketNewsExcel } from "../widgets/Fundamentals/marketNews/marketNewsExcelFunction";
import { newsSentimentExcel } from "../widgets/Fundamentals/newsSentiment/newsSentimentExcelFunction";
import { peersExcel } from "../widgets/Fundamentals/Peers/peersExcelFunction";
import { secFilingsExcel } from "../widgets/Fundamentals/secFilings/secFilingsExcelFunction";


import { candleExcel } from "../widgets/Price/candles/candleExcelFunction";
import { quoteExcel } from "../widgets/Price/quote/quoteExcelFunction";
import { splitsExcel } from "../widgets/Price/splits/splitsExcelFunction";

interface widgetDictInt {
    [key: string]: Function
}

export const excelRegister: widgetDictInt = {
    EstimatesEarningsCalendar: EarningsCalendarExcelFunction,
    EstimatesEPSSurprises: epsSuprisesExcel,
    EstimatesPriceTarget: priceTargetExcel,
    EstimatesRecommendationTrends: recTrendExcel,
    FundamentalsBasicFinancials: basicFinancialsExcel,
    FundamentalsCompanyNews: companyNewsExcel,
    FundamentalsCompanyProfile2: companyProfileExcel,
    FundamentalsFinancialsAsReported: financialsAsReportedExcel,
    FundamentalsIPOCalendar: ipoCalendarExcel,
    FundamentalsMarketNews: marketNewsExcel,
    FundamentalsNewsSentiment: newsSentimentExcel,
    FundamentalsPeers: peersExcel,
    FundamentalsSECFilings: secFilingsExcel,
    PriceCandles: candleExcel,
    PriceQuote: quoteExcel,
    PriceSplits: splitsExcel,
}

export const excelRegister_singleSecurity: widgetDictInt = {
    EstimatesEarningsCalendar: EarningsCalendarExcelFunction,
    EstimatesEPSSurprises: epsSuprisesExcel,
    EstimatesPriceTarget: priceTargetExcel,
    EstimatesRecommendationTrends: recTrendExcel,
    FundamentalsBasicFinancials: basicFinancialsExcel,
    FundamentalsCompanyNews: companyNewsExcel,
    FundamentalsCompanyProfile2: companyProfileExcel,
    FundamentalsFinancialsAsReported: financialsAsReportedExcel,
    FundamentalsNewsSentiment: newsSentimentExcel,
    FundamentalsPeers: peersExcel,
    FundamentalsSECFilings: secFilingsExcel,
    PriceCandles: candleExcel,
    PriceSplits: splitsExcel,
}
