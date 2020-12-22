//Import props function from each widget/menu here and add to returnBodyProps function below.
import { dashBoardMenuProps } from "./../widgets/Menu/dashBoardMenu/dashBoardMenu.js";
import { watchListMenuProps } from "./../widgets/Menu/watchListMenu/watchListMenu.js";

import { candleWidgetProps } from "../widgets/Price/candles/candleWidget.js";
import { stockDetailWidgetProps } from "../widgets/Price/quote/stockDetailWidget.js";

import { newsWidgetProps } from "./../widgets/Fundamentals/companyNews/companyNewsBody.js";
import { metricsProps } from "./../widgets/Fundamentals/basicFinancials/basicFinancialsBody.js";
import { companyProfile2Props } from "./../widgets/Fundamentals/companyProfile2/companyProfile2Body.js";

export function returnBodyProps(that, key, ref = "pass") {
    let widgetBodyProps = {
        WatchListMenu: () => watchListMenuProps(that, key),
        DashBoardMenu: () => dashBoardMenuProps(that, key),
        PriceCandles: () => candleWidgetProps(that, ref),
        PriceQuote: () => stockDetailWidgetProps(that, ref),
        FundamentalsCompanyNews: () => newsWidgetProps(that, ref),
        FundamentalsBasicFinancials: () => metricsProps(that, ref),
        FundamentalsCompanyProfile2: () => companyProfile2Props(that, ref),
    };
    let renderBodyProps = widgetBodyProps[key];
    return renderBodyProps;
}