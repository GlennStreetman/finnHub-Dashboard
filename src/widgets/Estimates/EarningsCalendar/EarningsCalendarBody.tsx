import * as React from "react"
import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";

import { useAppDispatch, useAppSelector } from '../../../hooks';
import { rBuildVisableData } from '../../../slices/sliceShowData'
import { tSearchMongoDB } from '../../../thunks/thunkSearchMongoDB'

import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";

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

interface filters {
    description: string,
    endDate: number,
    startDate: number,
}

//add any additional type guard functions here used for live code.
function isFinnHubData(arg: any): arg is FinnHubAPIDataArray { //typeguard
    if (arg !== undefined && Object.keys(arg).length > 0 && arg.earningsCalendar && arg.earningsCalendar[0] && arg.earningsCalendar[0].date) {
        // console.log("returning true", arg)
        return true
    } else {
        // console.log("returning false", arg)
        return false
    }
}
//RENAME FUNCTION
function EstimatesEarningsCalendar(p: { [key: string]: any }, ref: any) {

    const startingstockData = () => {
        if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
            return (p.widgetCopy.stockData)
        } else { return ([]) }
    }

    const startingTargetStock = () => { //REMOVE IF TARGET STOCK NOT NEEDED.
        if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
            return (p.widgetCopy.targetSTock)
        } else { return ('') }
    }

    const [stockData, setStockData] = useState(startingstockData());
    const [targetStock, setTargetStock] = useState(startingTargetStock());
    const [display, setDisplay] = useState('EPS') //EPS or Revenue
    const isInitialMount = useRef(true); //update to false after first render.
    const dispatch = useDispatch(); //allows widget to run redux actions.

    const rShowData = useSelector((state) => { //REDUX Data associated with this widget.
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false' &&
            state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData: object = state.showData.dataSet[p.widgetKey][targetStock]
            return (showData)
        }
    })

    useImperativeHandle(ref, () => (
        //used to copy widgets when being dragged. example: if widget body renders time series data into chart, copy chart data.
        //add additional slices of state to list if they help reduce re-render time.
        {
            state: {
                stockData: stockData,
                targetStock: targetStock, //REMOVE IF NO TARGET STOCK
                display: display,
            },
        }
    ))

    useEffect(() => {
        //On mount, use widget copy, else build visable data.
        //On update, if change in target stock, rebuild visable data.
        if (isInitialMount.current && p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
            isInitialMount.current = false;
        } else {
            if (isInitialMount.current === true) { isInitialMount.current = false }
            const payload: object = {
                key: p.widgetKey,
                securityList: [[`${targetStock}`]]
            }
            dispatch(rBuildVisableData(payload))
        }
    }, [targetStock, p.widgetKey, p.widgetCopy, dispatch])

    useEffect((filters: filters = p.filters, update: Function = p.updateWidgetFilters, key: number = p.widgetKey) => {
        if (filters['startDate'] === undefined) {
            const startDate = -604800 * 1000 * 52 //1 year backward. Limited to 1 year on free version.
            const endDate = 0 //today.
            update(key, 'startDate', startDate)
            update(key, 'endDate', endDate)
            update(key, 'Description', 'Date numbers are millisecond offset from now. Used for Unix timestamp calculations.')

        }
    }, [p.filters, p.updateWidgetFilters, p.widgetKey])

    useEffect(() => {
        //DELETE IF NO TARGET STOCK
        //if stock not selected default to first stock.
        if (Object.keys(p.trackedStocks).length > 0 && targetStock === '') {
            const setDefault = p.trackedStocks[Object.keys(p.trackedStocks)[0]].key
            setTargetStock(setDefault)
        }
    }, [p.trackedStocks, targetStock])

    useEffect(() => { //on update to redux data, update widget stock data, as long as data passes typeguard.
        if (isFinnHubData(rShowData) === true) { setStockData(rShowData) } else { setStockData([]) }
    }, [rShowData])

    useEffect(() => { //on change to targetSecurity update widget focus
        if (p.targetSecurity !== '') {
            const target = `${p.widgetKey}-${p.targetSecurity}`
            setTargetStock(p.targetSecurity)
            dispatch(tSearchMongoDB([target]))
        }
    }, [p.targetSecurity, p.widgetKey, dispatch])

    function updateFilter(e) {
        if (isNaN(new Date(e.target.value).getTime()) === false) {
            const now = Date.now()
            const target = new Date(e.target.value).getTime();
            const offset = target - now
            const name = e.target.name;
            p.updateWidgetFilters(p.widgetKey, name, offset)
        }
    }

    function renderSearchPane() {
        //add search pane rendering logic here. Additional filters need to be added below.
        const stockList = Object.keys(p.trackedStocks);
        const stockListRows = stockList.map((el) =>
            <tr key={el + "container"}>
                <td key={el + "name"}>{p.trackedStocks[el].dStock(p.exchangeList)}</td>
                <td key={el + "buttonC"}>
                    <button
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
        const now = Date.now()
        const startUnixOffset = p.filters.startDate !== undefined ? p.filters.startDate : -604800 * 1000 * 52
        const startUnix = now + startUnixOffset
        const endUnixOffset = p.filters.startDate !== undefined ? p.filters.endDate : 0
        const endUnix = now + endUnixOffset
        const startDate = new Date(startUnix).toISOString().slice(0, 10);
        const endDate = new Date(endUnix).toISOString().slice(0, 10);

        let searchForm = (
            <>
                <div className="stockSearch">
                    <form className="form-stack">
                        <label htmlFor="start">Start date:</label>
                        <input className="btn" id="start" type="date" name="startDate" onChange={updateFilter} value={startDate}></input>
                        <br />
                        <label htmlFor="end">End date:</label>
                        <input className="btn" id="end" type="date" name="endDate" onChange={updateFilter} value={endDate}></input>
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
        const actual = display === 'EPS' ? 'epsActual' : 'revenueActual'
        const estimate = display === 'EPS' ? 'epsEstimate' : 'revenueEstimate'
        let sortedData = stockData['earningsCalendar'] !== undefined ? [...stockData['earningsCalendar']].sort((a, b) => (new Date(a.date) > new Date(b.date) ? 1 : -1)) : []
        let tableData = sortedData.map((el) => {
            return <tr key={"row" + el.date}>
                <td className='rightTE' key={"period" + el.date}> {`${el['year']} Q:${el['quarter']}`} </td>
                {/* <td className='rightTE' key={"estimate" + el.date}>{Number(el[estimate]).toFixed(2)}</td>             */}
                <td className='rightTE' key={"estimate" + el.date}>{Number(el[estimate]).toLocaleString(
                    undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2, })}
                </td>
                <td className='rightTE' key={"actual" + el.date}>{Number(el[actual]).toLocaleString(
                    undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2, })}
                </td>
                <td className='rightTE' key={"var" + el.date}>{Number(el[actual] - el[estimate]).toLocaleString(
                    undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2, })}
                </td>
                <td className='rightTE' key={"var2" + el.date}>{Number(
                    ((el[actual] - el[estimate]) / el[estimate]) * 100
                ).toLocaleString(
                    undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2, })}
                </td>
            </tr>
        })
        return tableData
    }

    function changeValueSelection(e) {
        const target = e.target.value;
        setDisplay(target)
    }

    function changeStockSelection(e) { //DELETE IF no target stock
        const target = e.target.value;
        const key = `${p.widgetKey}-${target}`
        setTargetStock(target)
        dispatch(tSearchMongoDB([key]))
    }

    function renderStockData() {
        let newSymbolList = ["EPS", "Revenue"].map((el) => (
            <option key={el} value={el}>
                {el}
            </option>
        ));
        let newStockList = Object.keys(p.trackedStocks).map((el) => (
            <option key={el + "ddl"} value={el}>
                {p.trackedStocks[el].dStock(p.exchangeList)}
            </option>
        ));

        if (stockData !== undefined) {
            let symbolSelectorDropDown = (
                <>
                    <div className="div-inline">
                        {"  Stock:  "}
                        <select className="btn" value={targetStock} onChange={changeStockSelection}>
                            {newStockList}
                        </select>

                        {"  Display:  "}
                        <select className="btn" value={display} onChange={changeValueSelection}>
                            {newSymbolList}
                        </select>

                    </div>
                    <table>
                        <thead>
                            <tr>
                                <td>Quarter</td>
                                <td>{display === 'EPS' ? 'EPS Estimate' : 'Revenue Estimate'}</td>
                                <td>{display === 'EPS' ? 'EPS Actual' : 'Revenue Actual'}</td>
                                <td>Variance</td>
                                <td>Variance%</td>
                            </tr>
                        </thead>
                        <tbody>{stockTable()}</tbody>
                    </table>
                </>
            );
            return symbolSelectorDropDown;
        }
    }

    return (
        <>
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
        </>
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
        targetSecurity: that.props.targetSecurity,
    };
    return propList;
}

export const EarningsCalendarFilters: filters = { //IF widget uses filters remember to define default filters here and add to topNavReg as 5th paramater.
    startDate: -604800 * 1000 * 52, //1 year backward. Limited to 1 year on free version.
    endDate: 0,  //today.
    description: 'Date numbers are millisecond offset from now. Used for Unix timestamp calculations.',
}

