import * as React from "react";
import { useState, forwardRef, useRef, useMemo } from "react";
import { widget } from "src/App";
import { finnHubQueue } from "src/appFunctions/appImport/throttleQueueAPI";

import { useAppDispatch, useAppSelector } from "../../../hooks";
import { convertCamelToProper } from "../../../appFunctions/stringFunctions";
import WidgetFilterDates from "../../../components/widgetFilterDates";

import { useDragCopy } from "./../../widgetHooks/useDragCopy";
import { useSearchMongoDb } from "./../../widgetHooks/useSearchMongoDB";
import { useBuildVisableData } from "./../../widgetHooks/useBuildVisableData";
import { useStartingFilters } from "./../../widgetHooks/useStartingFilters";

const useDispatch = useAppDispatch;
const useSelector = useAppSelector;

export interface FinnHubAPIData {
    date: string;
    exchange: string;
    name: string;
    numberOfShares: number;
    price: string;
    status: string;
    symbo: string;
    totalSharesValue: number;
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

function FundamentalsIPOCalendar(p: widgetProps, ref: any) {
    const isInitialMount = useRef(true); //update to false after first render.

    const startingPagination = () => {
        //REMOVE IF TARGET STOCK NOT NEEDED.
        if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
            return p.widgetCopy.paginationInt;
        } else {
            return 0;
        }
    };

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

    const startingStartDate = () => {
        //save dates as offsets from now
        const now = Date.now();
        const startUnixOffset = p.filters.startDate !== undefined ? p.filters.startDate : -604800 * 1000 * 52;
        const startUnix = now + startUnixOffset;
        const startDate = new Date(startUnix).toISOString().slice(0, 10);
        return startDate;
    };

    const startingEndDate = () => {
        //save dates as offsets from now
        const now = Date.now();
        const endUnixOffset = p.filters.startDate !== undefined ? p.filters.endDate : 604800 * 1000 * 52;
        const endUnix = now + endUnixOffset;
        const endDate = new Date(endUnix).toISOString().slice(0, 10);
        return endDate;
    };

    const [widgetCopy] = useState(startingWidgetCoptyRef());
    const [paginationInt, setPaginationInt] = useState(startingPagination());
    const [start, setStart] = useState(startingStartDate());
    const [end, setEnd] = useState(startingEndDate());
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
    const dashboardID = dashboardData?.[currentDashboard]?.["id"] ? dashboardData[currentDashboard]["id"] : -1;

    const rShowData = useSelector((state) => {
        //REDUX Data associated with this widget.
        if (state.dataModel !== undefined && state.dataModel.created !== "false" && state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData: object = state.showData.dataSet[p.widgetKey]["IPOS"];
            return showData;
        }
    });

    const updateFilterMemo = useMemo(() => {
        //used inst useStartingFilters Hook.
        return {
            startDate: start,
            endDate: end,
            Description: "Date numbers are millisecond offset from now. Used for Unix timestamp calculations.",
        };
    }, [start, end]);

    const focusSecurityList = useMemo(() => {
        //remove if all securities should stay in focus.
        return ["IPOS"];
    }, []);

    const getData = isInitialMount.current === true ? "first" : "IPOS";

    useDragCopy(ref, { paginationInt: paginationInt }); //useImperativeHandle. Saves state on drag. Dragging widget pops widget out of component array causing re-render as new component.
    useSearchMongoDb(currentDashboard, p.finnHubQueue, getData, p.widgetKey, widgetCopy, dispatch, isInitialMount, dashboardID); //on change to target security retrieve fresh data from mongoDB
    useBuildVisableData(["IPOS"], p.widgetKey, widgetCopy, dispatch, isInitialMount); //rebuild visable data on update to target security
    useStartingFilters(p.filters["startDate"], updateFilterMemo, p.widgetKey, dashboardData, currentDashboard, dispatch, apiKey, p.finnHubQueue);

    function renderSearchPane() {
        return (
            <>
                <WidgetFilterDates
                    start={start}
                    end={end}
                    setStart={setStart}
                    setEnd={setEnd}
                    widgetKey={p.widgetKey}
                    widgetType={p.widgetType}
                    dashboardData={dashboardData}
                    currentDashboard={currentDashboard}
                    apiKey={apiKey}
                    finnHubQueue={p.finnHubQueue}
                />
            </>
        );
    }

    function changeIncrement(e) {
        const newIncrement = paginationInt + e;
        if (newIncrement > -1 && newIncrement < rShowData?.["ipoCalendar"]?.length) setPaginationInt(newIncrement);
    }

    function stockTable(data) {
        if (data !== undefined) {
            let tableData = Object.keys(data).map((el) => (
                <tr key={"row" + el}>
                    <td className="rightTE" key={"heading" + el}>
                        {convertCamelToProper(el)}:&nbsp;&nbsp;
                    </td>
                    <td className="leftTE" key={"value" + el}>
                        {data[el]}
                    </td>
                </tr>
            ));
            return tableData;
        }
    }

    function renderStockData() {
        if (rShowData?.["ipoCalendar"] !== undefined) {
            let currentFiling = rShowData?.["ipoCalendar"]?.[paginationInt];
            let symbolSelectorDropDown = (
                <>
                    <div>
                        <button data-testid="pageBackward" onClick={() => changeIncrement(-1)}>
                            <i className="fa fa-backward" aria-hidden="true"></i>
                        </button>
                        <button onClick={() => changeIncrement(1)}>
                            <i data-testid="pageForward" className="fa fa-forward" aria-hidden="true"></i>
                        </button>
                    </div>
                    <div>
                        {rShowData !== undefined && (
                            <div className="scrollableDiv">
                                <table className="dataTable">
                                    <thead>
                                        <tr>
                                            <td>Heading</td>
                                            <td>Value</td>
                                        </tr>
                                    </thead>
                                    <tbody>{stockTable(currentFiling)}</tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            );
            return symbolSelectorDropDown;
        }
    }

    return (
        <div data-testid="ipoCalendarBody">
            {p.showEditPane === 1 && <>{renderSearchPane()}</>}
            {p.showEditPane === 0 && <>{renderStockData()}</>}
        </div>
    );
}

export default forwardRef(FundamentalsIPOCalendar);

export function IPOCalendarProps(that, key = "newWidgetNameProps") {
    let propList = {
        // apiKey: that.props.apiKey,
        // filters: that.props.widgetList[key]["filters"],
        // widgetKey: key,
    };
    return propList;
}

export const IPOCalendarFilters: object = {
    //IF widget uses filters remember to define default filters here and add to topNavReg as 5th paramater.
    startDate: -604800 * 1000 * 52,
    endDate: 604800 * 1000 * 52,
    Description: "Date numbers are millisecond offset from now. Used for Unix timestamp calculations.",
};
