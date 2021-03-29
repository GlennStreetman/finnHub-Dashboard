import * as React from "react"
import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";
import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";
import { tSearchMongoDB } from '../../../thunks/thunkSearchMongoDB'
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { rBuildVisableData } from '../../../slices/sliceShowData'

const useDispatch = useAppDispatch
const useSelector = useAppSelector

interface FinnHubAPIData {
    accesNumber: string,
    symbol: string,
    cik: string,
    form: string,
    filedDate: string,
    acceptedDate: string,
    reportUrl: string,
    fileingUrl: string,
}

interface FinnHubAPIDataArray {
    [index: number]: FinnHubAPIData
}

//add any additional type guard functions here used for live code.
function isFinnHubData(arg: any): arg is FinnHubAPIDataArray { //typeguard
    if (arg !== undefined && Object.keys(arg).length > 0 && arg[0].accessNumber) {
        // console.log("returning true", arg)
        return true
    } else {
        // console.log("returning false", arg)
        return false
    }
}

function FundamentalsSECFilings(p: { [key: string]: any }, ref: any) {

    const startingstockData = () => {
        if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
            return (p.widgetCopy.stockData)
        } else { return ([]) }
    }

    const startingTargetStock = () => { //REMOVE IF TARGET STOCK NOT NEEDED.
        if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
            return (p.widgetCopy.targetStock)
        } else { return ('') }
    }

    const startingPagination = () => { //REMOVE IF TARGET STOCK NOT NEEDED.
        if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
            return (p.widgetCopy.pageinationInt)
        } else { return (1) }
    }

    const [stockData, setStockData] = useState(startingstockData());
    const [targetStock, setTargetStock] = useState(startingTargetStock());
    const [pageinationInt, setPageinationInt] = useState(startingPagination());
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
                pageinationInt: pageinationInt,
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

    useEffect(() => {
        //DELETE IF NO TARGET STOCK
        //if stock not selected default to first stock.
        if (Object.keys(p.trackedStocks).length > 0 && targetStock === '') {
            const setDefault = p.trackedStocks[Object.keys(p.trackedStocks)[0]].key
            setTargetStock(setDefault)
        }
    }, [p.trackedStocks, targetStock])

    useEffect(() => { //on update to redux data, update widget stock data, as long as data passes typeguard.
        if (isFinnHubData(rShowData) === true) { setStockData(rShowData) }
    }, [rShowData])

    function changeIncrement(e) {
        const newpageinationInt = pageinationInt + e;
        if (newpageinationInt > 0 && newpageinationInt < 251) setPageinationInt(newpageinationInt);
    }

    function changeStockSelection(e) { //DELETE IF no target stock
        const target = e.target.value;
        const key = `${p.widgetKey}-${target}`
        setTargetStock(target)
        dispatch(tSearchMongoDB([key]))
        setPageinationInt(pageinationInt);
    }

    function formatURLS(e) {
        if (e.includes("http")) {
            return <a href={e} target="_blank" rel="noopener noreferrer">{e.slice(0, 21) + '...'}</a>
        } else return e
    }

    function stockTable(data) {
        if (data !== undefined) {
            let tableData = Object.keys(data).map((el) =>
                <tr key={"row" + el}>
                    <td key={"heading" + el}>{el}</td>
                    <td key={"value" + el}>{formatURLS(data[el])}</td>
                </tr>
            )
            return tableData
        } else {
            return <></>
        }
    }

    function renderSearchPane() {

        let stockList = Object.keys(p.trackedStocks);
        let row = stockList.map((el) =>
            p.showEditPane === 1 ? (
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
            ) : (
                <tr key={el + "pass"}></tr>
            )
        );
        let stockListTable = (
            <table>
                <tbody>{row}</tbody>
            </table>
        );
        return <>{stockListTable}</>;
    }

    function renderStockData() {
        const newSymbolList = Object.keys(p.trackedStocks).map((el) => (
            <option key={el + "ddl"} value={el}>
                {p.trackedStocks[el].dStock(p.exchangeList)}
            </option>
        ));
        const currentFiling = stockData[pageinationInt]
        const symbolSelectorDropDown = (
            <>
                <div>
                    <select value={targetStock} onChange={changeStockSelection}>
                        {newSymbolList}
                    </select>
                    <button onClick={() => changeIncrement(-1)}>
                        <i className="fa fa-backward" aria-hidden="true"></i>
                    </button>
                    <button onClick={() => changeIncrement(1)}>
                        <i className="fa fa-forward" aria-hidden="true"></i>
                    </button>
                </div>
            </>
        )
        const stockDataTable = (
            <>
                {symbolSelectorDropDown}
                <div>
                    <table>
                        <thead>
                            <tr>
                                <td>Heading</td>
                                <td>Value</td>
                            </tr>
                        </thead>
                        <tbody>{stockTable(currentFiling)}</tbody>
                    </table>
                </div></>
        )

        return stockDataTable;
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

export default forwardRef(FundamentalsSECFilings)

export function secFilingsProps(that, key = "newWidgetNameProps") {
    let propList = {
        apiKey: that.props.apiKey,
        defaultExchange: that.props.defaultExchange,
        exchangeList: that.props.exchangeList,
        filters: that.props.widgetList[key]["filters"],
        showPane: that.showPane,
        trackedStocks: that.props.widgetList[key]["trackedStocks"],
        updateDefaultExchange: that.props.updateDefaultExchange,
        updateWidgetFilters: that.props.updateWidgetFilters,
        updateGlobalStockList: that.props.updateGlobalStockList,
        updateWidgetStockList: that.props.updateWidgetStockList,
        widgetKey: key,
    };
    return propList;
}
