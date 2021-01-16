//Import props function from each widget/menu here and add to returnBodyProps function below.
import { dashBoardMenuProps } from "./../widgets/Menu/dashBoardMenu/dashBoardMenu.js";
import { watchListMenuProps } from "./../widgets/Menu/watchListMenu/watchListMenu.js";

import { recommendationTrendsProps } from "./../widgets/Estimates/RecommendationTrends/recommendationTrendsBody.js";
import { priceTargetProps } from "./../widgets/Estimates/PriceTarget/priceTargetBody.js";
import { EPSSurprisesProps } from "./../widgets/Estimates/EPSSurprises/EPSSurpsisesBody.js";
import {EarningsCalendarProps} from "../widgets/Estimates/EarningsCalendar/EarningsCalendarBody.js";

import { newsWidgetProps } from "./../widgets/Fundamentals/companyNews/companyNewsBody.js";
import { marketNewsProps } from "./../widgets/Fundamentals/marketNews/marketNewsBody.js";
import { metricsProps } from "./../widgets/Fundamentals/basicFinancials/basicFinancialsBody.js";
import { companyProfile2Props } from "./../widgets/Fundamentals/companyProfile2/companyProfile2Body.js";
import { newsSentimentsProps } from "../widgets/Fundamentals/newsSentiment/newsSentimentBody.js";
import { peersProps } from "../widgets/Fundamentals/Peers/peersBody.js";
import { financialsAsReportedProps } from "../widgets/Fundamentals/financialsAsReported/financialsAsReportedBody.js";
import { secFilingsProps } from "../widgets/Fundamentals/secFilings/secFilingsBody.js";
import { IPOCalendarProps } from "../widgets/Fundamentals/IPOCalendar/IPOCalendarBody.js";

import { candleWidgetProps } from "../widgets/Price/candles/candleWidget.js";
import { stockDetailWidgetProps } from "../widgets/Price/quote/stockDetailWidget.js";
import {PriceSplitsProps} from "../widgets/Price/splits/PriceSplitsBody.js";

export function returnBodyProps(that, key, ref = "pass") {
    let widgetBodyProps = {
        WatchListMenu: () => watchListMenuProps(that, key),
        DashBoardMenu: () => dashBoardMenuProps(that, key),
        EstimatesRecommendationTrends: () => recommendationTrendsProps(that, ref),
        EstimatesPriceTarget: () => priceTargetProps(that, ref),
        EstimatesEPSSurprises: () => EPSSurprisesProps(that, ref),
        EstimatesEarningsCalendar: () => EarningsCalendarProps(that, ref),
        PriceCandles: () => candleWidgetProps(that, ref),
        PriceQuote: () => stockDetailWidgetProps(that, ref),
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