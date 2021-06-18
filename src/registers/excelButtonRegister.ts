// import all API string generator functions here and register below to widgetDict.

import { EarningsCalendarExcelFunction } from "../widgets/Estimates/EarningsCalendar/EarningsCalendarExcelFunction";
import { epsSuprisesExcel } from "../widgets/Estimates/EPSSurprises/epsSurprisesExcelFunction";
import { priceTargetExcel } from "../widgets/Estimates/PriceTarget/priceTargetExcelFunction";
import { recTrendExcel } from "../widgets/Estimates/RecommendationTrends/recTrendExcelFunction";

import { basicFinancialsExcel } from "../widgets/Fundamentals/basicFinancials/basicFinancialsExcelFunction";
import { companyNewsExcel } from "../widgets/Fundamentals/companyNews/companyNewsExcelFunction";
import { companyProfileExcel } from "../widgets/Fundamentals/companyProfile2/companyProfileExcelFunction";

import { candleExcel } from "../widgets/Price/candles/candleExcelFunction";

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

    PriceCandles: candleExcel,
}
