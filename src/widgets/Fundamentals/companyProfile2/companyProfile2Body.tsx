import * as React from "react";
import { useState, forwardRef, useRef, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import { widget } from "src/App";
import { finnHubQueue } from "src/appFunctions/appImport/throttleQueueAPI";

import WidgetFocus from "../../../components/widgetFocus";
import WidgetRemoveSecurityTable from "../../../components/widgetRemoveSecurityTable";
import StockSearchPane, {
    searchPaneProps,
} from "../../../components/stockSearchPane";

import { convertCamelToProper } from "../../../appFunctions/stringFunctions";

import { useDragCopy } from "./../../widgetHooks/useDragCopy";
import { useSearchMongoDb } from "../../widgetHooks/useSearchMongoDB";
import { useBuildVisableData } from "../../widgetHooks/useBuildVisableData";
import { useUpdateFocus } from "./../../widgetHooks/useUpdateFocus";

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

function FundamentalsCompanyProfile2(p: widgetProps, ref: any) {
    const isInitialMount = useRef(true); //update to false after first render.
    const dispatch = useDispatch(); //allows widget to run redux actions.

    const startingWidgetCopyRef = () => {
        if (isInitialMount.current === true) {
            if (
                p.widgetCopy !== undefined &&
                typeof p.widgetCopy.widgetID === "number"
            ) {
                return p.widgetCopy.widgetID;
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    };

    const [widgetCopy] = useState(startingWidgetCopyRef());
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
    const dashboardID = dashboardData?.[currentDashboard]?.["id"]
        ? dashboardData[currentDashboard]["id"]
        : -1;

    const rShowData = useSelector((state) => {
        //REDUX Data associated with this widget.
        if (
            state.dataModel !== undefined &&
            state.dataModel.created !== "false" &&
            state.showData.dataSet[p.widgetKey] !== undefined
        ) {
            const showData: object =
                state?.showData?.dataSet?.[p.widgetKey]?.[
                    p.config.targetSecurity
                ];
            return showData;
        }
    });

    const focusSecurityList = useMemo(() => {
        //remove if all securities should stay in focus.
        return [p?.config?.targetSecurity];
    }, [p?.config?.targetSecurity]);

    useDragCopy(ref, {}); //useImperativeHandle. Saves state on drag. Dragging widget pops widget out of component array causing re-render as new component.
    useUpdateFocus(
        targetSecurity,
        p.widgetKey,
        p.config,
        dashboardData,
        currentDashboard,
        p.enableDrag,
        dispatch
    ); //sets security focus in config. Used for redux.visable data and widget excel templating.
    useSearchMongoDb(
        currentDashboard,
        p.finnHubQueue,
        p.config.targetSecurity,
        p.widgetKey,
        widgetCopy,
        dispatch,
        isInitialMount,
        dashboardID
    ); //on change to target security retrieve fresh data from mongoDB
    useBuildVisableData(
        focusSecurityList,
        p.widgetKey,
        widgetCopy,
        dispatch,
        isInitialMount
    ); //rebuild visable data on update to target security

    function stockListForm() {
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
        return stockListTable;
    }

    function mapStockData() {
        const rows = rShowData ? (
            Object.keys(rShowData).map((key) => (
                <tr key={rShowData?.[key + "tr"] + key}>
                    <td key={rShowData?.[key + "td"]}>{`${convertCamelToProper(
                        key
                    )}: `}</td>
                    <td key={rShowData?.[key + "td2"] + key}>
                        {key === "logo" ? (
                            <img
                                key={rShowData?.[key + "pic"] + key}
                                width="25%"
                                src={rShowData?.[key]}
                                alt={rShowData?.[key]}
                            ></img>
                        ) : (
                            rShowData?.[key]
                        )}
                    </td>
                </tr>
            ))
        ) : (
            <tr></tr>
        );
        return rows;
    }

    function renderSearchPane() {
        return <>{stockListForm()}</>;
    }

    function renderStockData() {
        // console.log(rShowData, p.config.targetSecurit);
        const stockData =
            rShowData === undefined ? (
                <tr>
                    <td>`No data availabole for ${p.config.targetSecurity}`</td>
                </tr>
            ) : (
                mapStockData()
            );

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
                <table>
                    <thead>
                        <tr>
                            <td>Key</td>
                            <td>Value</td>
                        </tr>
                    </thead>
                    <tbody>{stockData}</tbody>
                </table>
            </>
        );

        return stockTable;
    }

    return (
        <div data-testid="body-companyProfile2Body">
            {p.showEditPane === 1 ? (
                <>
                    {React.createElement(StockSearchPane, searchPaneProps(p))}
                    {renderSearchPane()}
                </>
            ) : (
                <></>
            )}
            {p.showEditPane === 0 ? <>{renderStockData()}</> : <></>}
        </div>
    );
}

export default forwardRef(FundamentalsCompanyProfile2);

export function companyProfile2Props(that, key = "newWidgetNameProps") {
    let propList = {
        // apiKey: that.props.apiKey,
        // defaultExchange: that.props.defaultExchange,
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
