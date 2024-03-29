import * as React from "react";
import { useState, forwardRef, useRef, useMemo, useEffect } from "react";
import { finnHubQueue } from "src/appFunctions/appImport/throttleQueueAPI";

import { useAppDispatch, useAppSelector } from "../../../hooks";
import { RootState } from "../../../store";
import { tGetSymbolList, reqObj } from "./../../../slices/sliceExchangeData";

import { useDragCopy } from "./../../widgetHooks/useDragCopy";
import { useSearchMongoDb } from "./../../widgetHooks/useSearchMongoDB";
import { useBuildVisableData } from "./../../widgetHooks/useBuildVisableData";
import { useUpdateFocus } from "./../../widgetHooks/useUpdateFocus";

import WidgetFocus from "../../../components/widgetFocus";
import WidgetRemoveSecurityTable from "../../../components/widgetRemoveSecurityTable";
import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPane";

const useDispatch = useAppDispatch;
const useSelector = useAppSelector;

export interface FinnHubAPIData {
    [key: number]: string;
}

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

function FundamentalsPeers(p: widgetProps, ref: any) {
    const isInitialMount = useRef(true); //update to false after first render.

    const startingWidgetCoptyRef = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy !== undefined && p.widgetCopy.widgetID !== null) {
                return p.widgetCopy.widgetID;
            } else {
                return -1;
            }
        } else {
            return -1;
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
    const defaultExchange = useSelector((state) => {
        return state.defaultExchange;
    });
    const stockDataExchange = useSelector((state) => state.exchangeData.e.ex);

    const rShowData = useSelector((state: RootState) => {
        //REDUX Data associated with this widget.
        if (state.dataModel !== undefined && state.dataModel.created !== "false" && state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData: any = state?.showData?.dataSet?.[p.widgetKey]?.[p.config.targetSecurity];
            return showData;
        }
    });

    const rExchange = useSelector((state: any) => {
        const exchangeData: any = state.exchangeData.e.data;
        const widgetData = state.showData.dataSet[p.widgetKey] ? state?.showData?.dataSet?.[p.widgetKey]?.[p.config.targetSecurity] : {};
        const lookupNames: Object = {};
        for (const s in widgetData) {
            const stockKey = `${defaultExchange}-${widgetData[s]}`;
            const name = exchangeData && exchangeData[stockKey] ? exchangeData[stockKey].description : "";
            lookupNames[stockKey] = name;
        }
        return lookupNames;
    });

    useEffect(() => {
        //update exchange data if not updating, on user input.
        if (apiKey !== "" && defaultExchange !== stockDataExchange && stockDataExchange !== "updating") {
            const tGetSymbolObj: reqObj = {
                exchange: defaultExchange,
                apiKey: apiKey,
                finnHubQueue: p.finnHubQueue,
                dispatch: dispatch,
            };
            dispatch(tGetSymbolList(tGetSymbolObj));
        }
    }, [apiKey, defaultExchange, stockDataExchange]);

    const focusSecurityList = useMemo(() => {
        //remove if all securities should stay in focus.
        return [p?.config?.targetSecurity];
    }, [p?.config?.targetSecurity]);

    useDragCopy(ref, {}); //useImperativeHandle. Saves state on drag. Dragging widget pops widget out of component array causing re-render as new component.
    useUpdateFocus(targetSecurity, p.widgetKey, p.config, dashboardData, currentDashboard, p.enableDrag, dispatch); //sets security focus in config. Used for redux.visable data and widget excel templating.
    useSearchMongoDb(currentDashboard, p.finnHubQueue, p.config.targetSecurity, p.widgetKey, widgetCopy, dispatch, isInitialMount, dashboardID); //on change to target security retrieve fresh data from mongoDB
    useBuildVisableData(focusSecurityList, p.widgetKey, widgetCopy, dispatch, isInitialMount); //rebuild visable data on update to target security

    function getStockName(stock) {
        try {
            const stockName = rExchange !== undefined ? rExchange[stock] : "";
            return stockName;
        } catch {
            return " ";
        }
    }

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
        const stockDataRows = Array.isArray(rShowData)
            ? rShowData.map((el) => (
                  <tr key={el + "row"}>
                      <td key={el + "symbol"}>{el}</td>
                      <td key={el + "name"}>{getStockName(`${defaultExchange}-${el}`)}</td>
                  </tr>
              ))
            : [];

        return (
            <>
                <WidgetFocus
                    widgetType={p.widgetType}
                    widgetKey={p.widgetKey}
                    trackedStocks={p.trackedStocks}
                    exchangeList={exchangeList}
                    config={p.config}
                    dashBoardData={dashboardData}
                    enableDrag={p.enableDrag}
                    currentDashboard={currentDashboard}
                />
                <div className="scrollableDiv">
                    <table className="dataTable">
                        <thead>
                            <tr>
                                <td>Symbol</td>
                                <td>Description</td>
                            </tr>
                        </thead>
                        <tbody>{stockDataRows}</tbody>
                    </table>
                </div>
            </>
        );
    }

    return (
        <div data-testid="body-peersBody">
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

export default forwardRef(FundamentalsPeers);

export function peersProps(that, key = "newWidgetNameProps") {
    let propList = {};
    return propList;
}
