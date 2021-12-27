//Import props function from each widget/menu here and add to returnBodyProps function below.
import { dashBoardMenuProps } from "../widgets/Menu/dashBoardMenu/dashBoardMenu";
import { watchListMenuProps } from "../widgets/Menu/watchListMenu/watchListMenu";
import { gqlMenuProps } from '../widgets/Menu/GQLMenu/GQLMenu'

import { recommendationTrendsProps } from "../widgets/Estimates/RecommendationTrends/recommendationTrendsBody";
import { priceTargetProps } from "../widgets/Estimates/PriceTarget/priceTargetBody";
import { EPSSurprisesProps } from "../widgets/Estimates/EPSSurprises/EPSSurpsisesBody";
import { EarningsCalendarProps } from "../widgets/Estimates/EarningsCalendar/EarningsCalendarBody";

import { newsWidgetProps } from "../widgets/Fundamentals/companyNews/companyNewsBody";
import { marketNewsProps } from "../widgets/Fundamentals/marketNews/marketNewsBody";
import { metricsProps } from "../widgets/Fundamentals/basicFinancials/basicFinancialsBody";
import { companyProfile2Props } from "../widgets/Fundamentals/companyProfile2/companyProfile2Body";
import { newsSentimentsProps } from "../widgets/Fundamentals/newsSentiment/newsSentimentBody";
import { peersProps } from "../widgets/Fundamentals/Peers/peersBody";
import { financialsAsReportedProps } from "../widgets/Fundamentals/financialsAsReported/financialsAsReportedBody";
import { secFilingsProps } from "../widgets/Fundamentals/secFilings/secFilingsBody";
import { IPOCalendarProps } from "../widgets/Fundamentals/IPOCalendar/IPOCalendarBody";

import { candleWidgetProps } from "../widgets/Price/candles/candleWidget";
import { quoteBodyProps } from "../widgets/Price/quote/quoteBody";
import { PriceSplitsProps } from "../widgets/Price/splits/PriceSplitsBody";

export function returnExtraProps(that, key, ref = "pass") {
    let widgetBodyProps = {
        watchListMenu: () => watchListMenuProps(that, key),
        dashBoardMenu: () => dashBoardMenuProps(that, key),
        GQLMenu: () => gqlMenuProps(that, key),
        EstimatesRecommendationTrends: () => recommendationTrendsProps(that, ref),
        EstimatesPriceTarget: () => priceTargetProps(that, ref),
        EstimatesEPSSurprises: () => EPSSurprisesProps(that, ref),
        EstimatesEarningsCalendar: () => EarningsCalendarProps(that, ref),
        PriceCandles: () => candleWidgetProps(that, ref),
        PriceQuote: () => quoteBodyProps(that, ref),
        PriceSplits: () => PriceSplitsProps(that, ref),
        FundamentalsCompanyNews: () => newsWidgetProps(that, ref),
        FundamentalsMarketNews: () => marketNewsProps(that, ref),
        FundamentalsBasicFinancials: () => metricsProps(that, ref),
        FundamentalsCompanyProfile2: () => companyProfile2Props(that, ref),
        FundamentalsNewsSentiment: () => newsSentimentsProps(that, ref),
        FundamentalsPeers: () => peersProps(that, ref),
        FundamentalsFinancialsAsReported: () => financialsAsReportedProps(that, ref),
        FundamentalsSECFilings: () => secFilingsProps(that, ref),
        FundamentalsIPOCalendar: () => IPOCalendarProps(that, ref),
    };
    let renderBodyProps = widgetBodyProps[key];
    return renderBodyProps;
}