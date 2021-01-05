//Import props function from each widget/menu here and add to returnBodyProps function below.
import { dashBoardMenuProps } from "./../widgets/Menu/dashBoardMenu/dashBoardMenu.js";
import { watchListMenuProps } from "./../widgets/Menu/watchListMenu/watchListMenu.js";

import { candleWidgetProps } from "../widgets/Price/candles/candleWidget.js";
import { stockDetailWidgetProps } from "../widgets/Price/quote/stockDetailWidget.js";

import { newsWidgetProps } from "./../widgets/Fundamentals/companyNews/companyNewsBody.js";
import { marketNewsProps } from "./../widgets/Fundamentals/marketNews/marketNewsBody.js";
import { metricsProps } from "./../widgets/Fundamentals/basicFinancials/basicFinancialsBody.js";
import { companyProfile2Props } from "./../widgets/Fundamentals/companyProfile2/companyProfile2Body.js";
import { newsSentimentsProps } from "../widgets/Fundamentals/newsSentiment/newsSentimentBody.js";
import { peersProps } from "../widgets/Fundamentals/Peers/peersBody.js";
import { financialsAsReportedProps } from "../widgets/Fundamentals/financialsAsReported/financialsAsReportedBody.js";


export function returnBodyProps(that, key, ref = "pass") {
    let widgetBodyProps = {
        WatchListMenu: () => watchListMenuProps(that, key),
        DashBoardMenu: () => dashBoardMenuProps(that, key),
        PriceCandles: () => candleWidgetProps(that, ref),
        PriceQuote: () => stockDetailWidgetProps(that, ref),
        FundamentalsCompanyNews: () => newsWidgetProps(that, ref),
        FundamentalsMarketNews: () => marketNewsProps(that, ref),
        FundamentalsBasicFinancials: () => metricsProps(that, ref),
        FundamentalsCompanyProfile2: () => companyProfile2Props(that, ref),
        FundamentalsNewsSentiment: () => newsSentimentsProps(that, ref),
        FundamentalsPeers: () => peersProps(that, ref),
        FundamentalsFinancialsAsReported: () => financialsAsReportedProps(that, ref),
    };
    let renderBodyProps = widgetBodyProps[key];
    return renderBodyProps;
}