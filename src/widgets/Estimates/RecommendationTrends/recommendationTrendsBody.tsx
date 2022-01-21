import * as React from "react";
import { useState, useEffect, forwardRef, useRef, useMemo } from "react";
import RecTrendChart from "./recTrendsChart";
import { widget } from "src/App";
import { finnHubQueue } from "src/appFunctions/appImport/throttleQueueAPI";

import { createSelector } from "reselect";
import { storeState } from "./../../../store";

//widget components
import WidgetFocus from "../../../components/widgetFocus";
import WidgetRemoveSecurityTable from "../../../components/widgetRemoveSecurityTable";
import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPane";

//hooks
import { useDragCopy } from "./../../widgetHooks/useDragCopy";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import { useSearchMongoDb } from "./../../widgetHooks/useSearchMongoDB";
import { useBuildVisableData } from "./../../widgetHooks/useBuildVisableData";
import { useUpdateFocus } from "./../../widgetHooks/useUpdateFocus";

const useDispatch = useAppDispatch;
const useSelector = useAppSelector;

export interface FinnHubAPIData {
    symbol: string;
    buy: number;
    hold: number;
    period: string;
    sell: number;
    strongBuy: number;
    strongSell: number;
}

export interface FinnHubAPIDataArray {
    [index: number]: FinnHubAPIData;
}

interface DataChartObject {
    strongSell: object;
    sell: object;
    hold: object;
    buy: object;
    strongBuy: object;
}

interface widgetProps {
    config: any;
    enableDrag: boolean;
    filters: any;
    finnHubQueue: finnHubQueue;
    pagination: number;
    showEditPane: number;
    trackedStocks: any;
    widgetCopy: widget;
    widgetKey: string | number;
    widgetType: string;
}

interface chartGroup {
    label: string;
    data: number[];
    backgroundColor: string;
}

function EstimatesRecommendationTrends(p: widgetProps, ref: any) {
    const isInitialMount = useRef(true); //update to false after first render.

    const startingWidgetCoptyRef = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy !== undefined && typeof p.widgetCopy.widgetID === "number") {
                return p.widgetCopy.widgetID;
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    };

    const [widgetCopy] = useState(startingWidgetCoptyRef());
    const [chartData, setChartData] = useState<false | object>(false);
    const dispatch = useDispatch(); //allows widget to run redux actions.

    const showDataSelector = createSelector(
        (state: storeState) => state.showData.dataSet[p.widgetKey][p.config.targetSecurity],
        (returnValue) => returnValue
    );

    const rShowData = useSelector((state) => {
        //REDUX Data associated with this widget.
        if (state.dataModel !== undefined && state.dataModel.created !== "false" && state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData: any = showDataSelector(state);
            return showData;
        }
    });

    const focusSecurityList = useMemo(() => {
        //remove if all securities should stay in focus.
        return [p?.config?.targetSecurity];
    }, [p?.config?.targetSecurity]);

    const apiKey = useSelector((state) => {
        return state.apiKey;
    });
    const currentDashboard = useSelector((state) => {
        return state.currentDashboard;
    });
    const dashboardData = useSelector((state) => {
        return state.dashboardData;
    });
    const targetSecurity = useSelector((state) => {
        return state.targetSecurity;
    });
    const exchangeList = useSelector((state) => {
        return state.exchangeList.exchangeList;
    });
    const dashboardID = dashboardData?.[currentDashboard]?.["id"] ? dashboardData[currentDashboard]["id"] : -1;

    useDragCopy(ref, { chartData: chartData }); // stockData: JSON.parse(JSON.stringify(stockData)),   useImperativeHandle. Saves state on drag. Dragging widget pops widget out of component array causing re-render as new component.
    useUpdateFocus(targetSecurity, p.widgetKey, p.config, dashboardData, currentDashboard, p.enableDrag, dispatch); //sets security focus in config. Used for redux.visable data and widget excel templating.
    useSearchMongoDb(currentDashboard, p.finnHubQueue, p.config.targetSecurity, p.widgetKey, widgetCopy, dispatch, isInitialMount, dashboardID); //on change to target security retrieve fresh data from mongoDB
    useBuildVisableData(focusSecurityList, p.widgetKey, widgetCopy, dispatch, isInitialMount); //rebuild visable data on update to target security

    useEffect(() => {
        //create chart data

        const labels: string[] = [];
        const sOptions = ["strongSell", "sell", "hold", "buy", "strongBuy"];

        const strongSell: chartGroup = {
            label: "Strong Sell",
            data: [],
            backgroundColor: "#FF333C",
        };

        const sell: chartGroup = {
            label: "Sell",
            data: [],
            backgroundColor: "#FF3396",
        };

        const hold: chartGroup = {
            label: "hold",
            data: [],
            backgroundColor: "#F0FF33",
        };

        const buy: chartGroup = {
            label: "Buy",
            data: [],
            backgroundColor: "#33E0FF",
        };

        const strongBuy: chartGroup = {
            label: "Strong Buy",
            data: [],
            backgroundColor: "#3342FF",
        };

        const rawData = Array.isArray(rShowData) === true ? rShowData.slice(0, 12) : []; //limit to 12 recommendations.
        rawData.forEach((el: FinnHubAPIData) => {
            labels.unshift(el.period);
            strongSell.data.unshift(el.strongSell);
            sell.data.unshift(el.sell);
            hold.data.unshift(el.hold);
            buy.data.unshift(el.buy);
            strongBuy.data.unshift(el.strongBuy);
        });

        const data = {
            labels: labels,
            datasets: [strongSell, sell, hold, buy, strongBuy],
        };

        setChartData(data);
    }, [rShowData, p.config.targetSecurity]);

    function renderSearchPane() {
        let stockTable = (
            <WidgetRemoveSecurityTable
                trackedStocks={p.trackedStocks}
                widgetKey={p.widgetKey}
                exchangeList={exchangeList}
                dashBoardData={dashboardData}
                currentDashboard={currentDashboard}
                apiKey={apiKey}
            />
        );
        return stockTable;
    }

    function renderStockData() {
        let chartBody = (
            <div data-testid="recTrendBody">
                <div className="div-stack">
                    <WidgetFocus
                        widgetType={p.widgetType}
                        widgetKey={p.widgetKey}
                        trackedStocks={p.trackedStocks}
                        exchangeList={exchangeList}
                        config={p.config}
                        dashBoardData={dashboardData}
                        currentDashboard={currentDashboard}
                        enableDrag={p.enableDrag}
                    />
                </div>
                <div data-testid={`"chart-${p.config.targetSecurity}`}>
                    <RecTrendChart chartData={chartData} />
                </div>
            </div>
        );
        return chartBody;
    }
    return (
        <>
            {p.showEditPane === 1 && (
                <>
                    {React.createElement(StockSearchPane, searchPaneProps(p))}
                    {renderSearchPane()}
                </>
            )}
            {p.showEditPane === 0 && <>{renderStockData()}</>}
        </>
    );
}

export default forwardRef(EstimatesRecommendationTrends);

export function recommendationTrendsProps(that, key = "newWidgetNameProps") {
    let propList = {
        // apiKey: that.props.apiKey,
        // defaultExchange: that.props.defaultExchange,
        // exchangeList: that.props.exchangeList,
        // filters: that.props.widgetList[key]["filters"],
        // trackedStocks: that.props.widgetList[key]["trackedStocks"],
        // widgetKey: key,
        // targetSecurity: that.props.targetSecurity,
        // dashBoardData: that.props.dashBoardData,
        // currentDashBoard: that.props.currentDashBoard
    };
    return propList;
}
