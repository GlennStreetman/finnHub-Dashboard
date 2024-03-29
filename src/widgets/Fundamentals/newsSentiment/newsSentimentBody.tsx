import * as React from "react";
import { useState, useMemo, forwardRef, useRef } from "react";
import { widget } from "src/App";
import { finnHubQueue } from "src/appFunctions/appImport/throttleQueueAPI";

import { useAppDispatch, useAppSelector } from "../../../hooks";
import { convertCamelToProper } from "../../../appFunctions/stringFunctions";

import { useDragCopy } from "./../../widgetHooks/useDragCopy";
import { useSearchMongoDb } from "./../../widgetHooks/useSearchMongoDB";
import { useBuildVisableData } from "./../../widgetHooks/useBuildVisableData";
import { useUpdateFocus } from "./../../widgetHooks/useUpdateFocus";

import WidgetFocus from "../../../components/widgetFocus";
import WidgetRemoveSecurityTable from "../../../components/widgetRemoveSecurityTable";
import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPane";

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
    widgetCopy: any;
    widgetKey: string | number;
    widgetType: string;
}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function FundamentalsNewsSentiment(p: widgetProps, ref: any) {
    const isInitialMount = useRef(true); //update to false after first render.

    const startingWidgetCoptyRef = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy !== undefined && p.widgetCopy.widgetID !== null) {
                return p.widgetCopy.widgetID;
            } else if (p?.config?.targetSecurity) {
                return p?.config?.targetSecurity;
            } else {
                return "";
            }
        }
    };

    const [widgetCopy] = useState(startingWidgetCoptyRef());
    const dispatch = useDispatch(); //allows widget to run redux actions.
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
        return [p?.config?.targetSecurity]; //Object.keys(p.trackedStocks)
    }, [p?.config?.targetSecurity]); //[p.trackedStocks])

    useDragCopy(ref, {}); //useImperativeHandle. Saves state on drag. Dragging widget pops widget out of component array causing re-render as new component.
    useUpdateFocus(targetSecurity, p.widgetKey, p.config, dashboardData, currentDashboard, p.enableDrag, dispatch); //sets security focus in config. Used for redux.visable data and widget excel templating.
    useSearchMongoDb(currentDashboard, p.finnHubQueue, p.config.targetSecurity, p.widgetKey, widgetCopy, dispatch, isInitialMount, dashboardID); //on change to target security retrieve fresh data from mongoDB
    useBuildVisableData(focusSecurityList, p.widgetKey, widgetCopy, dispatch, isInitialMount); //rebuild visable data on update to target security

    function renderSearchPane() {
        let stockListTable = (
            <WidgetRemoveSecurityTable
                trackedStocks={p.trackedStocks}
                widgetKey={p.widgetKey}
                exchangeList={exchangeList}
                dashBoardData={dashboardData}
                currentDashboard={currentDashboard}
                apiKey={apiKey}
            />
        );
        return <>{stockListTable}</>;
    }

    function renderStockData() {
        const dataRows =
            typeof rShowData === "object" ? (
                Object.entries(rShowData).map((el) => {
                    if (typeof el[1] !== "object" && el[0] !== "filters") {
                        return (
                            <tr key={`${el[0]}-${el[1]}`}>
                                <td className="rightTE" key={`${el[0]}-${el[1]}2`}>
                                    {convertCamelToProper(el[0])}:&nbsp;&nbsp;{" "}
                                </td>
                                <td className="centerTE" key={`${el[0]}-${el[1]}3`}>
                                    {el[1]}
                                </td>
                            </tr>
                        );
                    } else {
                        return <tr key={`${el[0]}-${el[1]}4`}></tr>;
                    }
                })
            ) : (
                <></>
            );

        const targetSecurityName = toTitleCase(p.trackedStocks?.[p.config.targetSecurity] ? p.trackedStocks[p.config.targetSecurity].description : "");
        const stockTable = (
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
                <br />
                <table className="dataTable">
                    <thead>
                        <tr>
                            <td>{targetSecurityName} Metrics</td>
                            <td>Value</td>
                        </tr>
                    </thead>
                    <tbody>{dataRows}</tbody>
                </table>
            </>
        );
        return stockTable;
    }

    return (
        <div data-testid="newsSentimentBody">
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

export default forwardRef(FundamentalsNewsSentiment);

export function newsSentimentsProps(that, key = "newWidgetNameProps") {
    let propList = {
        // apiKey: that.props.apiKey,
        // exchangeList: that.props.exchangeList,
        // filters: that.props.widgetList[key]["filters"],
        // trackedStocks: that.props.widgetList[key]["trackedStocks"],
        // widgetKey: key,
        // targetSecurity: that.props.targetSecurity,
        // dashBoardData: that.props.dashBoardData,
        // currentDashBoard: that.props.currentDashBoard,
    };
    return propList;
}
