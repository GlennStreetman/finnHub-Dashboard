import * as React from "react"
import { useState, forwardRef, useRef, useMemo } from "react";

import { useAppDispatch, useAppSelector } from '../../../hooks';
import { convertCamelToProper } from './../../../appFunctions/stringFunctions'

import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";

import { useDragCopy } from './../../widgetHooks/useDragCopy'
import { useTargetSecurity } from './../../widgetHooks/useTargetSecurity'
import { useSearchMongoDb } from './../../widgetHooks/useSearchMongoDB'
import { useBuildVisableData } from './../../widgetHooks/useBuildVisableData'

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

    const rShowData = useSelector((state) => { //REDUX Data associated with this widget.
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false' &&
            state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData: FinnHubAPIDataArray = state.showData.dataSet?.[p.widgetKey]?.[p.config.targetSecurity]?.['earningsCalendar']
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
    useTargetSecurity(p.widgetKey, p.trackedStocks, p.updateWidgetConfig, p?.config?.targetSecurity,) //sets target security for widget on mount and change to security focus from watchlist.
    useSearchMongoDb(p.config.targetSecurity, p.widgetKey, dispatch) //on change to target security retrieve fresh data from mongoDB
    useBuildVisableData(focusSecurityList, p.widgetKey, widgetCopy, dispatch, isInitialMount) //rebuild visable data on update to target security
    useStartingFilters(p.filters['startDate'], updateFilterMemo, p.updateWidgetFilters, p.widgetKey)

    function updateStartDate(e) {
        setStart(e.target.value)
    }

    function changePagination(e) {
        const newIncrement = pagination + e;
        if (newIncrement > 0 && newIncrement < Object.keys(rShowData ? rShowData : 1).length) setPagination(newIncrement)
    }

    function updateEndDate(e) {
        setEnd(e.target.value)
    }

    function updateFilter(e) {
        console.log('UPDATE FILTER', start, end)
        if (isNaN(new Date(e.target.value).getTime()) === false) {
            const now = Date.now()
            const target = new Date(e.target.value).getTime();
            const offset = target - now
            const name = e.target.name;
            console.log(name, e.target.value)
            p.updateWidgetFilters(p.widgetKey, { [name]: offset })
        }
    }

    function renderSearchPane() {
        //add search pane rendering logic here. Additional filters need to be added below.
        const stockList = Object.keys(p.trackedStocks);
        const stockListRows = stockList.map((el) =>
            <tr key={el + "container"}>
                <td key={el + "name"}>{p.trackedStocks[el].dStock(p.exchangeList)}</td>
                <td key={el + "buttonC"}>
                    <button data-testid={`remove-${el}`}
                        key={el + "button"}
                        onClick={() => {
                            p.updateWidgetStockList(p.widgetKey, el);
                        }}
                    >
                        <i className="fa fa-times" aria-hidden="true" key={el + "icon"}></i>
                    </button>
                </td>
            </tr>
        )

        let searchForm = ( // onBlur={updateFilter}
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

    function stockTable() {
        let tableData = rShowData && rShowData?.[pagination] ? Object.entries(rShowData[pagination]).map((el) => {
            const heading = el[0] ? el[0] : ''
            const value = el[1] ? el[1] : ''
            return <tr key={"row" + heading + pagination}>
                <td className='rightTE' key={"name" + heading}>{convertCamelToProper(el[0])}</td>
                <td className='rightTE' key={"vale" + value}>{value}</td>
            </tr>
        }) : <></>
        return tableData
    }

    function changeStockSelection(e) { //DELETE IF no target stock
        const target = e.target.value;
        p.updateWidgetConfig(p.widgetKey, {
            targetSecurity: target,
        })
    }

    function renderStockData() {
        let newStockList = Object.keys(p.trackedStocks).map((el) => (
            <option key={el + "ddl"} value={el}>
                {p.trackedStocks[el].dStock(p.exchangeList)}
            </option>
        ));


        let symbolSelectorDropDown = (
            <>
                <div id='earningsCalendarBody'>
                    <select data-testid="ECstockSelector" className="btn" value={p.config.targetSecurity} onChange={changeStockSelection}>
                        {newStockList}
                    </select>
                    <button onClick={() => changePagination(-1)}>
                        <i className="fa fa-backward" aria-hidden="true"></i>
                    </button>
                    <button onClick={() => changePagination(1)}>
                        <i className="fa fa-forward" aria-hidden="true"></i>
                    </button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <td>Heading</td>
                            <td>Value</td>
                        </tr>
                    </thead>
                    <tbody>{stockTable()}</tbody>
                </table>
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
        showPane: that.showPane,
        trackedStocks: that.props.widgetList[key]["trackedStocks"],
        filters: that.props.widgetList[key]["filters"],
        updateWidgetFilters: that.props.updateWidgetFilters,
        updateGlobalStockList: that.props.updateGlobalStockList,
        updateWidgetStockList: that.props.updateWidgetStockList,
        widgetKey: key,
        exchangeList: that.props.exchangeList,
        defaultExchange: that.props.defaultExchange,
        updateDefaultExchange: that.props.updateDefaultExchange,
        updateWidgetConfig: that.props.updateWidgetConfig,
        targetSecurity: that.props.targetSecurity,
    };
    return propList;
}

export const EarningsCalendarFilters: filters = { //IF widget uses filters remember to define default filters here and add to topNavReg as 5th paramater.
    startDate: -604800 * 1000 * 52, //1 year backward. Limited to 1 year on free version.
    endDate: 604800 * 1000 * 52,  //1 year forward. Limited to 1 year on free version.
    description: 'Date numbers are millisecond offset from now. Used for Unix timestamp calculations.',
}

fetch('https://finnhub.io/api/v1/calendar/earnings?from=2020-06-26&to=2022-06-24&symbol=AAPL&token=sandbox_bujhtnn48v6rigi03lsg')
    .then((dat) => dat.json())
    .then(((data) => { console.log(data) }))