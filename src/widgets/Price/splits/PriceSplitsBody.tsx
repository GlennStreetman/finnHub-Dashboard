import * as React from "react"
import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";

import { useAppDispatch, useAppSelector } from '../../../hooks';
import { rBuildVisableData } from '../../../slices/sliceShowData'
import { tSearchMongoDB } from '../../../thunks/thunkSearchMongoDB'

import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";

const useDispatch = useAppDispatch
const useSelector = useAppSelector

interface finnHubSplitNode {
    date: number,
    fromFactor: number,
    symbol: number,
    toFactor: number,
}

interface finnHubSplitArray {
    [index: number]: finnHubSplitNode
}

interface filters {
    description: string,
    endDate: number,
    startDate: number,
}

function isFinnHubSplitList(arg: any): arg is finnHubSplitArray { //typeguard
    if (arg !== undefined && Object.keys(arg).length > 0 && arg[0].date) {
        // console.log("returning true", arg)
        return true
    } else {
        // console.log("returning false", arg)
        return false
    }
}

function PriceSplits(p: { [key: string]: any }, ref: any) {

    const startingstockData = () => {
        if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
            return (p.widgetCopy.stockData)
        } else { return ([]) }
    }

    const startingTargetStock = () => {
        if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
            return (p.widgetCopy.targetSTock)
        } else { return ('') }
    }

    const [stockData, setStockData] = useState(startingstockData());
    const [targetStock, setTargetStock] = useState(startingTargetStock());
    const isInitialMount = useRef(true);
    const dispatch = useDispatch();

    const rShowData = useSelector((state) => {
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false' &&
            state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData: object = state.showData.dataSet[p.widgetKey][targetStock]
            return (showData)
        }
    })

    useImperativeHandle(ref, () => (
        //used to copy widgets when being dragged.
        {
            state: {
                stockData: stockData,
                targetStock: targetStock,
            },
        }
    ))

    useEffect(() => {
        //On mount, use widget copy, else build visable data.
        //On update, if change in candle selection, rebuild visable data.
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
        //Setup filters if not yet done.
        if (filters['startDate'] === undefined) {
            const startDateOffset = -604800 * 1000 * 52 * 20 //20 year backward. Limited to 1 year on free version.
            const endDateOffset = 0 //today.
            update(key, 'startDate', startDateOffset)
            update(key, 'endDate', endDateOffset)
            update(key, 'Description', 'Date numbers are millisecond offset from now. Used for Unix timestamp calculations.')

        }
    }, [p.filters, p.updateWidgetFilters, p.widgetKey])

    useEffect(() => {
        //if stock not selected default to first stock.
        if (Object.keys(p.trackedStocks).length > 0 && targetStock === '') {
            const setDefault = p.trackedStocks[Object.keys(p.trackedStocks)[0]].key
            setTargetStock(setDefault)
        }
    }, [p.trackedStocks, targetStock])

    useEffect(() => {
        if (isFinnHubSplitList(rShowData) === true) { setStockData(rShowData) } else { setStockData([]) }
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
                    <form className="form-inline">
                        <label htmlFor="start">Start date:</label>
                        <input className="btn" id="start" type="date" name="startDate" onChange={updateFilter} value={startDate}></input>
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
        // console.log('stockData', stockData)
        if (Object.keys(stockData).length) {
            const stockList: finnHubSplitNode[] = Object.values(stockData)
            let sortedData = stockList.sort((a, b) => (new Date(a.date) > new Date(b.date) ? 1 : -1))
            let tableData = sortedData.map((el) => {

                return <tr key={"row" + el.date}>
                    <td>{el.date}</td>
                    <td>{el.fromFactor}</td>
                    <td>{el.toFactor}</td>
                </tr>

            })
            return tableData
        }
    }

    function changeStockSelection(e) {
        const target = e.target.value;
        const key = `${p.widgetKey}-${target}`
        setTargetStock(target)
        dispatch(tSearchMongoDB([key]))
    }


    function renderStockData() {
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
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <td>Date</td>
                                <td>From:</td>
                                <td>To:</td>
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

export default forwardRef(PriceSplits)

export function PriceSplitsProps(that, key = "newWidgetNameProps") {
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

export const priceSplitsFilters: object = {
    startDate: -604800 * 1000 * 52 * 20, //20 years
    endDate: 0,
    "Description": 'Date numbers are millisecond offset from now. Used for Unix timestamp calculations.'
}

