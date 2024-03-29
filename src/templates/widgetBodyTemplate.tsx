import * as React from "react"
import { useState, useMemo, forwardRef, useRef } from "react";

import { useAppDispatch, useAppSelector } from '../hooks';

import { useDragCopy } from './../widgets/widgetHooks/useDragCopy'

import { useSearchMongoDb } from './../widgets/widgetHooks/useSearchMongoDB'
import { useBuildVisableData } from './../widgets/widgetHooks/useBuildVisableData'
import { useStartingFilters } from './../widgets/widgetHooks/useStartingFilters'
import { useUpdateFocus } from './../widgets/widgetHooks/useUpdateFocus'
import StockSearchPane, { searchPaneProps } from "../components/stockSearchPane";

import { dStock } from './../appFunctions/formatStockSymbols'
import { rSetWidgetStockList } from 'src/slices/sliceDashboardData'

import { UpdateWidgetFilters } from 'src/appFunctions/appImport/widgetLogic'
import { updateWidgetConfig } from 'src/appFunctions/appImport/widgetLogic'

const useDispatch = useAppDispatch
const useSelector = useAppSelector

// interface FinnHubAPIData { //rename
//     //defined shape of data returns by finnHub
// }

// interface FinnHubAPIDataArray {
//     [index: number]: FinnHubAPIData
// }

// interface filters { //Any paramas not related to stock used by finnHub endpoint.
//     //remove if not needed, else define
//     description: string,
//     endDate: number,
//     startDate: number,
//     //additional filters...
// }

//RENAME FUNCTION
function NewWidgetEndpointBody(p: { [key: string]: any }, ref: any) {
    const isInitialMount = useRef(true); //update to false after first render.

    const startingWidgetCoptyRef = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy !== undefined && p.widgetCopy.widgetID !== null) {
                return p.widgetCopy.widgetID
            } else { return -1 }
        }
    }

    const startingStartDate = () => { //REMOVE IF FILTERS NOT NEEDED
        const now = Date.now()
        const startUnixOffset = p.filters.startDate !== undefined ? p.filters.startDate : -604800 * 1000 * 52
        const startUnix = now + startUnixOffset
        const startDate = new Date(startUnix).toISOString().slice(0, 10);
        return startDate
    }

    const startingEndDate = () => { //REMOVE IF FILTERS NOT NEEDED
        const now = Date.now()
        const endUnixOffset = p.filters.startDate !== undefined ? p.filters.endDate : 0
        const endUnix = now + endUnixOffset
        const endDate = new Date(endUnix).toISOString().slice(0, 10);
        return endDate
    }

    const [widgetCopy] = useState(startingWidgetCoptyRef())
    const [start, setStart] = useState(startingStartDate()) //REMOVE IF FILTERS NOT NEEDED
    const [end, setEnd] = useState(startingEndDate()) //REMOVE IF FILTERS NOT NEEDED
    const dispatch = useDispatch(); //allows widget to run redux actions.

    const rShowData = useSelector((state) => { //REDUX Data associated with this widget.
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false' &&
            state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData: object = state.showData.dataSet[p.widgetKey][p?.config?.targetSecurity]
            return (showData)
        }
    })

    const focusSecurityList = useMemo(() => { //remove if all securities should stay in focus.
        return [p?.config?.targetSecurity]
    }, [p?.config?.targetSecurity])

    const updateFilterMemo = useMemo(() => { //remove if no filters
        return {
            startDate: start,
            endDate: end,
            Description: 'Date numbers are millisecond offset from now. Used for Unix timestamp calculations.'
        }
    }, [start, end])

    useDragCopy(ref, {})//useImperativeHandle. Saves state on drag. Dragging widget pops widget out of component array causing re-render as new component.
    useUpdateFocus(p.targetSecurity, p.widgetKey, p.config, p.dashBoardData, p.currentDashBoard, p.enableDrag, dispatch) //sets security focus in config. Used for redux.visable data and widget excel templating.
    useSearchMongoDb(p.currentDashBoard, p.finnHubQueue, p.config.targetSecurity, p.widgetKey, widgetCopy, dispatch, isInitialMount, p.dashboardID) //on change to target security retrieve fresh data from mongoDB
    useBuildVisableData(focusSecurityList, p.widgetKey, widgetCopy, dispatch, isInitialMount) //rebuild visable data on update to target security
    useStartingFilters(p.filters['startDate'], updateFilterMemo, p.widgetKey, p.dashBoardData, p.currentDashBoard, p.dispatch, p.apiKey, p.finnHubQueue)

    function updateStartDate(e) { //remove if filters not needed
        setStart(e.target.value)
    }

    function updateEndDate(e) {//remove if filters not needed
        setEnd(e.target.value)
    }

    function updateFilter(e) { //remove if filters not needed
        console.log('UPDATE FILTER', start, end)
        if (isNaN(new Date(e.target.value).getTime()) === false) {
            const now = Date.now()
            const target = new Date(e.target.value).getTime();
            const offset = target - now
            const name = e.target.name;
            console.log(name, e.target.value)
            UpdateWidgetFilters(p.widgetKey, { [name]: offset }, p.dashBoardData, p.currentDashBoard, dispatch, p.apiKey, p.finnHubQueue)
        }
    }

    function renderSearchPane() {
        //add search pane rendering logic here. Additional filters need to be added below.

        const stockList = Object.keys(p.trackedStocks);
        const stockListRows = stockList.map((el) =>
            <tr key={el + "container"}>
                <td key={el + "name"}>{dStock(p.trackedStocks[el], p.exchangeList)}</td>
                <td key={el + "buttonC"}>
                    <button
                        data-testid={`remove-${el}`}
                        key={el + "button"}
                        onClick={() => {
                            dispatch(rSetWidgetStockList({
                                widgetId: p.widgetKey,
                                symbol: el,
                                currentDashboard: p.currentDashBoard,
                                stockObj: false
                            })) //consider updating data model on remove?
                        }}
                    >
                        <i className="fa fa-times" aria-hidden="true" key={el + "icon"}></i>
                    </button>
                </td>
            </tr>
        )

        let searchForm = (
            <>
                <div className="stockSearch">
                    <form className="form-stack">
                        <label htmlFor="start">Start date:</label>
                        <input className="btn" id="start" type="date" name="startDate" onChange={updateStartDate} onBlur={updateFilter} value={start}></input>
                        <br />
                        <label htmlFor="end">End date:</label>
                        <input className="btn" id="end" type="date" name="endDate" onChange={updateEndDate} onBlur={updateFilter} value={end}></input>
                    </form>
                </div>
                <table>
                    <tbody>{stockListRows}</tbody>
                </table>
            </>
        );
        return searchForm
    }

    function changeStockSelection(e) { //DELETE IF no target stock
        const target = e.target.value;
        updateWidgetConfig(
            p.widgetKey,
            { targetSecurity: target, },
            p.dashBoardData,
            p.currentDashBoard,
            p.enableDrag,
            dispatch,
        )
        //if any configs need to be reset add logic here. Pagination?
    }


    function renderStockData() {
        return rShowData ? Object.keys(rShowData).map((el => <tr>{el}</tr>)) : <></>
    }

    return (
        <div data-testid='---widgetName----'>
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
//RENAME
export default forwardRef(NewWidgetEndpointBody)
//RENAME
export function NewWidgetProps(that, key = "newWidgetNameProps") {
    let propList = {
        apiKey: that.props.apiKey,
        defaultExchange: that.props.defaultExchange,
        exchangeList: that.props.exchangeList,
        filters: that.props.widgetList[key]["filters"],
        trackedStocks: that.props.widgetList[key]["trackedStocks"],
        widgetKey: key,
        targetSecurity: that.props.targetSecurity,
    };
    return propList;
}

