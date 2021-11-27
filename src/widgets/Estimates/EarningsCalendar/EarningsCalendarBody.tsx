import * as React from "react"
import { useState, forwardRef, useRef, useMemo } from "react";

import { createSelector } from 'reselect'
import { storeState } from './../../../store'

import { useAppDispatch, useAppSelector } from '../../../hooks';
import { convertCamelToProper } from './../../../appFunctions/stringFunctions'

//components
import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";
import WidgetFocus from '../../../components/widgetFocus'
import WidgetRemoveSecurityTable from '../../../components/widgetRemoveSecurityTable'
import WidgetFilterDates from '../../../components/widgetFilterDates'

//hooks
import { useDragCopy } from './../../widgetHooks/useDragCopy'
import { useSearchMongoDb } from './../../widgetHooks/useSearchMongoDB'
import { useBuildVisableData } from './../../widgetHooks/useBuildVisableData'
import { useUpdateFocus } from './../../widgetHooks/useUpdateFocus'
import { useResetPagination } from './../../widgetHooks/useResetPagination'

import { useStartingFilters } from './../../widgetHooks/useStartingFilters'


const useDispatch = useAppDispatch
const useSelector = useAppSelector

interface FinnHubAPIData { //rename
    date: string,
    epsActual: number,
    epsEstimate: number,
    hour: string,
    quarter: number, //1,2,3,4
    revernueActual: number,
    revenueEstimate: number,
    symbol: string,
    year: string, //4 digit year
}

interface FinnHubAPIDataArray {
    [index: number]: FinnHubAPIData
}

export interface finnHubDataObj {
    earningsCalendar: FinnHubAPIDataArray
}

interface filters {
    description: string,
    endDate: number,
    startDate: number,
}

function EstimatesEarningsCalendar(p: { [key: string]: any }, ref: any) {

    const isInitialMount = useRef(true); //update to false after first render.

    const startingWidgetCoptyRef = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy !== undefined && p.widgetCopy.widgetID !== null) {
                return p.widgetCopy.widgetID
            } else { return -1 }
        }
    }

    const startingStartDate = () => { //save dates as offsets from now
        const now = Date.now()
        const startUnixOffset = p.filters.startDate !== undefined ? p.filters.startDate : -604800 * 1000 * 52
        const startUnix = now + startUnixOffset
        const startDate = new Date(startUnix).toISOString().slice(0, 10);
        return startDate
    }

    const startingEndDate = () => { //save dates as offsets from now
        const now = Date.now()
        const endUnixOffset = p.filters.startDate !== undefined ? p.filters.endDate : 0
        const endUnix = now + endUnixOffset
        const endDate = new Date(endUnix).toISOString().slice(0, 10);
        return endDate
    }

    const startingPagination = () => {
        if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
            return (p.widgetCopy.pagination)
        } else { return (0) }
    }

    const [widgetCopy] = useState(startingWidgetCoptyRef())
    const [start, setStart] = useState(startingStartDate())
    const [end, setEnd] = useState(startingEndDate())
    const [pagination, setPagination] = useState(startingPagination())
    const dispatch = useDispatch(); //allows widget to run redux actions.

    const showDataSelector = createSelector(
        (state: storeState) => state.showData.dataSet?.[p.widgetKey]?.[p.config.targetSecurity]?.['earningsCalendar'],
        returnValue => returnValue
    )

    const rShowData = useSelector((state) => { //REDUX Data associated with this widget.
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false' &&
            state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData: FinnHubAPIDataArray = showDataSelector(state)
            return (showData)
        }
    })

    const updateFilterMemo = useMemo(() => { //used inst useStartingFilters Hook.
        return {
            startDate: start,
            endDate: end,
            Description: 'Date numbers are millisecond offset from now. Used for Unix timestamp calculations.'
        }
    }, [start, end])

    const focusSecurityList = useMemo(() => { //remove if all securities should stay in focus.
        return [p?.config?.targetSecurity]
    }, [p?.config?.targetSecurity])


    useDragCopy(ref, { pagination: pagination, })//useImperativeHandle. Saves state on drag. Dragging widget pops widget out of component array causing re-render as new component.
    useUpdateFocus(p.targetSecurity, p.widgetKey, p.config, p.dashBoardData, p.currentDashBoard, p.enableDrag, p.saveDashboard, p.updateAppState) //sets security focus in config. Used for redux.visable data and widget excel templating.
    useSearchMongoDb(p.currentDashBoard, p.finnHubQueue, p.config.targetSecurity, p.widgetKey, widgetCopy, dispatch, isInitialMount, p.dashboardID) //on change to target security retrieve fresh data from mongoDB
    useBuildVisableData(focusSecurityList, p.widgetKey, widgetCopy, dispatch, isInitialMount) //rebuild visable data on update to target security
    useStartingFilters(p.filters['startDate'], updateFilterMemo, p.widgetKey, p.dashBoardData, p.currentDashBoard, p.updateAppState, p.dispatch, p.apiKey, p.finnHubQueue, p.saveDashboard)
    useResetPagination(p.config.targetSecurity, setPagination)

    function changePagination(e) {
        const newIncrement = pagination + e;
        // console.log('change pagination', newIncrement)
        if (newIncrement >= 0 && newIncrement < Object.keys(rShowData ? rShowData : { 1: 1 }).length) setPagination(newIncrement)
    }

    function renderSearchPane() {
        let searchForm = (
            <>
                <WidgetFilterDates
                    start={start}
                    end={end}
                    setStart={setStart}
                    setEnd={setEnd}
                    widgetKey={p.widgetKey}
                    widgetType={p.widgetType}
                    dashBoardData={p.dashBoardData}
                    currentDashBoard={p.currentDashBoard}
                    apiKey={p.apiKey}
                    finnHubQueue={p.finnHubQueue}
                    updateAppState={p.updateAppState}
                    saveDashboard={p.saveDashBoard}
                />
                <WidgetRemoveSecurityTable
                    trackedStocks={p.trackedStocks}
                    widgetKey={p.widgetKey}
                    exchangeList={p.exchangeList}
                    dashBoardData={p.dashBoardData}
                    currentDashboard={p.currentDashBoard}
                    apiKey={p.apiKey}
                />
            </>
        );
        return searchForm
    }

    function stockTable() {
        let tableData = rShowData && rShowData?.[pagination] ? Object.entries(rShowData[pagination]).map((el) => {
            const heading = el[0] ? `${el[0]}` : ''
            const value = el[1] ? el[1] : ''
            return <tr key={"row" + heading + pagination}>
                <td className='rightTE' key={"name" + heading}>{convertCamelToProper(el[0])}: &nbsp;&nbsp;</td>
                <td className='leftTE' key={"vale" + value}>{value}</td>
            </tr>
        }) : <></>
        return tableData
    }

    function renderStockData() {

        let symbolSelectorDropDown = (
            <>
                <div id='earningsCalendarBody'>
                    <WidgetFocus
                        widgetType={p.widgetType}
                        widgetKey={p.widgetKey}
                        trackedStocks={p.trackedStocks}
                        exchangeList={p.exchangeList}
                        config={p.config}
                        dashBoardData={p.dashBoardData}
                        currentDashBoard={p.currentDashBoard}
                        enableDrag={p.enableDrag}
                        saveDashboard={p.saveDashboard}
                    />
                    <button data-testid="pageBackward" onClick={() => changePagination(-1)}>
                        <i className="fa fa-backward" aria-hidden="true"></i>
                    </button>
                    <button data-testid="pageForward" onClick={() => changePagination(1)}>
                        <i className="fa fa-forward" aria-hidden="true"></i>
                    </button>
                </div>
                <div className='scrollableDiv'>
                    <table className='dataTable'>
                        <thead>
                            <tr>
                                <td>Heading</td>
                                <td>Value</td>
                            </tr>
                        </thead>
                        <tbody>{stockTable()}</tbody>
                    </table>
                </div>
            </>
        );
        return symbolSelectorDropDown;

    }
    return (
        <div data-testid="earningsCalendarBody">
            {p.showEditPane === 1 && (
                <>
                    {React.createElement(StockSearchPane, searchPaneProps(p))}
                    {renderSearchPane()}
                </>
            )}
            {p.showEditPane === 0 && (
                <>
                    {renderStockData()}
                </>
            )}
        </div>
    )
}

export default forwardRef(EstimatesEarningsCalendar)

export function EarningsCalendarProps(that, key = "newWidgetNameProps") {
    let propList = {
        apiKey: that.props.apiKey,
        trackedStocks: that.props.widgetList[key]["trackedStocks"],
        filters: that.props.widgetList[key]["filters"],
        widgetKey: key,
        exchangeList: that.props.exchangeList,
        targetSecurity: that.props.targetSecurity,
        currentDashBoard: that.props.currentDashBoard,
        dashBoardData: that.props.dashBoardData,
    };
    return propList;
}

export const EarningsCalendarFilters: filters = { //IF widget uses filters remember to define default filters here and add to topNavReg as 5th paramater.
    startDate: -604800 * 1000 * 52, //1 year backward. Limited to 1 year on free version.
    endDate: 604800 * 1000 * 52,  //1 year forward. Limited to 1 year on free version.
    description: 'Date numbers are millisecond offset from now. Used for Unix timestamp calculations.',
}


