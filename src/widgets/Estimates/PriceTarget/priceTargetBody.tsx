import * as React from "react";
import { useState, forwardRef, useRef, useMemo } from "react";
import { widget } from "src/App";
import { finnHubQueue } from "src/appFunctions/appImport/throttleQueueAPI";

import { useAppDispatch, useAppSelector } from "../../../hooks";

import { convertCamelToProper } from "../../../appFunctions/stringFunctions";

//hooks
import { useDragCopy } from "./../../widgetHooks/useDragCopy";
import { useSearchMongoDb } from "../../widgetHooks/useSearchMongoDB";
import { useBuildVisableData } from "../../widgetHooks/useBuildVisableData";
import { useUpdateFocus } from "./../../widgetHooks/useUpdateFocus";

//widget components
import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPane";
import WidgetFocus from "../../../components/widgetFocus";
import WidgetRemoveSecurityTable from "../../../components/widgetRemoveSecurityTable";
// import { dStock } from './../../../appFunctions/formatStockSymbols'

const useDispatch = useAppDispatch;
const useSelector = useAppSelector;

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

function PriceTargetBody(p: widgetProps, ref: any) {
    const isInitialMount = useRef(true); //update to false after first render.
    const dispatch = useDispatch(); //allows widget to run redux actions.

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

    const rShowData = useSelector((state) => {
        //REDUX Data associated with this widget.
        if (state.dataModel !== undefined && state.dataModel.created !== "false" && state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData: object = state.showData.dataSet[p.widgetKey][p.config.targetSecurity];
            return showData;
        }
    });

    const focusSecurityList = useMemo(() => {
        //remove if all securities should stay in focus.
        return [p?.config?.targetSecurity];
    }, [p?.config?.targetSecurity]);

    useDragCopy(ref, {}); //useImperativeHandle. Saves state on drag. Dragging widget pops widget out of component array causing
    useUpdateFocus(targetSecurity, p.widgetKey, p.config, dashboardData, currentDashboard, p.enableDrag, dispatch); //sets security focus in config. Used for redux.visable data and widget excel templating.
    useSearchMongoDb(currentDashboard, p.finnHubQueue, p.config.targetSecurity, p.widgetKey, widgetCopy, dispatch, isInitialMount, dashboardID); //on change to target security retrieve fresh data from mongoDB
    useBuildVisableData(focusSecurityList, p.widgetKey, widgetCopy, dispatch, isInitialMount); //rebuild visable data on update to target security

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
        const parseList = ["targetHigh", "targetLow", "targetMean", "targetMedian"];

        const stockDataRows = rShowData ? (
            Object.keys(rShowData).map((el) => (
                <tr key={el + "row"}>
                    <td className="rightTE" key={el + "symbol"}>
                        {convertCamelToProper(el)}: &nbsp;&nbsp;
                    </td>
                    <td key={el + "name"}>
                        {parseList.includes(el) ? parseInt(rShowData[el]).toLocaleString("en-US", { minimumFractionDigits: 2 }) : rShowData[el]}
                    </td>
                </tr>
            ))
        ) : (
            <></>
        );
        return (
            <>
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
                <div className="scrollableDiv">
                    <table className="dataTable">
                        <thead>
                            <tr>
                                <td>Heading</td>
                                <td>Value</td>
                            </tr>
                        </thead>
                        <tbody data-testid="ptRow">{stockDataRows}</tbody>
                    </table>
                </div>
            </>
        );
    }

    return (
        <div data-testid="container-priceTargetBody">
            {p.showEditPane === 1 && (
                <>
                    {React.createElement(StockSearchPane, searchPaneProps(p))}
                    {renderSearchPane()}
                </>
            )}
            {p.showEditPane === 0 && <>{renderStockData()}</>}
        </div>
    );
}

export default forwardRef(PriceTargetBody);

export function priceTargetProps(that, key = "newWidgetNameProps") {
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
