import * as React from "react"
import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";

import { useAppDispatch, useAppSelector } from '../../../hooks';
import { rBuildVisableData } from '../../../slices/sliceShowData'

const useDispatch = useAppDispatch
const useSelector = useAppSelector

interface FinnHubAPIData {
    exchange: string,
    name: string,
    numberOfShares: number,
    price: string,
    status: string,
    symbo: string,
    totalSharesValue: number,
}

interface FinnHubAPIDataArray {
    [index: number]: FinnHubAPIData
}

interface filters { //Any paramas not related to stock used by finnHub endpoint.
    description: string,
    endDate: number,
    startDate: number,
}

function isFinnHubData(arg: any): arg is FinnHubAPIDataArray { //typeguard
    if (arg !== undefined && Object.keys(arg).length > 0 && arg.ipoCalendar[0].date) {
        console.log("returning true", arg)
        return true
    } else {
        console.log("returning false", arg)
        return false
    }
}

function FundamentalsIPOCalendar(p: { [key: string]: any }, ref: any) {
    const isInitialMount = useRef(true); //update to false after first render.

    const startingstockData = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
                const stockData = JSON.parse(JSON.stringify(p.widgetCopy.stockData))
                return (stockData)
            } else {
                return ([])
            }
        }
    }

    const startingPagination = () => { //REMOVE IF TARGET STOCK NOT NEEDED.
        if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
            return (p.widgetCopy.paginationInt)
        } else { return (0) }
    }

    const startingWidgetCoptyRef = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy !== undefined && p.widgetCopy.widgetID !== null) {
                return p.widgetCopy.widgetID
            } else { return -1 }
        }
    }

    const [widgetCopy] = useState(startingWidgetCoptyRef())
    const [stockData, setStockData] = useState(startingstockData());
    const [paginationInt, setPaginationInt] = useState(startingPagination());
    const dispatch = useDispatch(); //allows widget to run redux actions.

    const rShowData = useSelector((state) => { //REDUX Data associated with this widget.
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false' &&
            state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData: object = state.showData.dataSet[p.widgetKey]['IPOS']
            return (showData)
        }
    })

    useImperativeHandle(ref, () => (
        //used to copy widgets when being dragged. example: if widget body renders time series data into chart, copy chart data.
        //add additional slices of state to list if they help reduce re-render time.
        {
            state: {
                stockData: stockData,
                paginationInt: paginationInt
            },
        }
    ))

    useEffect(() => {
        //On mount, use widget copy, else build visable data.
        //On update, if change in target stock, rebuild visable data.
        if (isInitialMount.current === true && widgetCopy === p.widgetKey) {
            isInitialMount.current = false;
        } else {
            if (isInitialMount.current === true) { isInitialMount.current = false }
            const payload: object = {
                key: `${p.widgetKey}`,
                securityList: [[`IPOS`]]
            }
            dispatch(rBuildVisableData(payload))
        }
    }, [p.widgetKey, widgetCopy, dispatch])

    useEffect((filters: filters = p.filters, update: Function = p.updateWidgetFilters, key: number = p.widgetKey) => {
        if (filters['startDate'] === undefined) {
            const startDateOffset = -604800 * 1000 * 52
            const endDateOffset = 604800 * 1000 * 52
            update(key, 'startDate', startDateOffset)
            update(key, 'endDate', endDateOffset)
            update(key, 'Description', 'Date numbers are millisecond offset from now. Used for Unix timestamp calculations.')
        }
    }, [p.filters, p.updateWidgetFilters, p.widgetKey])


    useEffect(() => { //on update to redux data, update widget stock data, as long as data passes typeguard.
        if (isFinnHubData(rShowData) === true) { setStockData(rShowData) } else { setStockData([]) }
    }, [rShowData])

    function updateFilter(e) {
        if (isNaN(new Date(e.target.value).getTime()) === false) {
            const now = Date.now()
            const target = new Date(e.target.value).getTime();
            const offset = target - now
            const name = e.target.name;
            p.updateWidgetFilters(p.widgetKey, name, offset)
        }
    }

    function findDate(offset) {
        const returnDate = new Date(Date.now() + offset).toISOString().slice(0, 10)
        return returnDate
    }

    function renderSearchPane() {
        const pf = p.filters
        return <>
            <div className="stockSearch">
                <form className="form-stack">
                    <label htmlFor="start">Start date:</label>
                    <input className="btn" id="start" type="date" name="startDate" onChange={updateFilter} value={findDate(pf.startDate)}></input>
                    <br />
                    <label htmlFor="end">End date:</label>
                    <input className="btn" id="end" type="date" name="endDate" onChange={updateFilter} value={findDate(pf.endDate)}></input>
                </form>
            </div>
        </>
    }

    function changeIncrement(e) {
        const newIncrement = paginationInt + e;
        console.log("new pagination", newIncrement)
        if (newIncrement > -1 && newIncrement < stockData.ipoCalendar.length) setPaginationInt(newIncrement)
    }

    function stockTable(data) {
        if (data !== undefined) {
            let tableData = Object.keys(data).map((el) =>
                <tr key={"row" + el}>
                    <td key={"heading" + el}>{el}</td>
                    <td key={"value" + el}>{data[el]}</td>
                </tr>
            )
            return tableData
        }
    }

    function renderStockData() {
        if (stockData.ipoCalendar !== undefined) {
            let currentFiling = stockData.ipoCalendar[paginationInt]
            let symbolSelectorDropDown = (
                <>
                    <div>
                        <button onClick={() => changeIncrement(-1)}>
                            <i className="fa fa-backward" aria-hidden="true"></i>
                        </button>
                        <button onClick={() => changeIncrement(1)}>
                            <i className="fa fa-forward" aria-hidden="true"></i>
                        </button>
                    </div>
                    <div>
                        {stockData !== undefined &&
                            <table>
                                <thead>
                                    <tr>
                                        <td>Heading</td>
                                        <td>Value</td>
                                    </tr>
                                </thead>
                                <tbody>{stockTable(currentFiling)}</tbody>
                            </table>}
                    </div>

                </>
            );
            return symbolSelectorDropDown;
        }
    }

    return (
        <>
            {p.showEditPane === 1 && (
                <>
                    {renderSearchPane()}
                </>
            )}
            {p.showEditPane === 0 && (
                <>
                    {renderStockData()}
                </>
            )}
        </>
    )
}
//RENAME
export default forwardRef(FundamentalsIPOCalendar)
//RENAME
export function IPOCalendarProps(that, key = "newWidgetNameProps") {
    let propList = {
        apiKey: that.props.apiKey,
        // defaultExchange: that.props.defaultExchange,
        // exchangeList: that.props.exchangeList,
        filters: that.props.widgetList[key]["filters"],
        showPane: that.showPane,
        // trackedStocks: that.props.widgetList[key]["trackedStocks"],
        // updateDefaultExchange: that.props.updateDefaultExchange,
        updateWidgetFilters: that.props.updateWidgetFilters,
        // updateGlobalStockList: that.props.updateGlobalStockList,
        // updateWidgetStockList: that.props.updateWidgetStockList,
        widgetKey: key,
    };
    return propList;
}

//rename
export const IPOCalendarFilters: object = { //IF widget uses filters remember to define default filters here and add to topNavReg as 5th paramater.
    startDate: -604800 * 1000 * 52,
    endDate: 604800 * 1000 * 52,
    "Description": 'Date numbers are millisecond offset from now. Used for Unix timestamp calculations.'
}
