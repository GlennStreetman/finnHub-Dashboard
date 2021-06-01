import * as React from "react"
import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";
import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";
import { tSearchMongoDB } from '../../../thunks/thunkSearchMongoDB'
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { rBuildVisableData } from '../../../slices/sliceShowData'
import { RootState } from '../../../store'
import { tGetSymbolList } from "./../../../slices/sliceExchangeData";

const useDispatch = useAppDispatch
const useSelector = useAppSelector

export interface FinnHubAPIData { //rename
    [key: number]: string
}

//add any additional type guard functions here used for live code.
function isFinnHubData(arg: FinnHubAPIData): arg is string[] { //typeguard
    if (arg !== undefined && Object.keys(arg).length > 0) {
        // console.log("returning true", arg)
        return true
    } else {
        console.log("returning false", arg)
        return false
    }
}
//RENAME FUNCTION
function FundamentalsPeers(p: { [key: string]: any }, ref: any) {
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

    const startingTargetStock = () => { //REMOVE IF TARGET STOCK NOT NEEDED.
        if (isInitialMount.current === true) {
            if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
                const targetStock = p.widgetCopy.targetStock
                return (targetStock)
            } else { return ('') }
        }
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
    const [targetStock, setTargetStock] = useState(startingTargetStock());
    const [updateExchange, setUpdateExchange] = useState(0)
    const dispatch = useDispatch(); //allows widget to run redux actions.

    const rShowData = useSelector((state: RootState) => { //REDUX Data associated with this widget.
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false' &&
            state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData: any = state.showData.dataSet[p.widgetKey][targetStock]
            return (showData)
        }
    })

    const rExchange = useSelector((state: any) => {
        if (state.exchangeData.e.ex === p.defaultExchange) {
            const exchangeData: any = state.exchangeData.e.data
            const widgetData = state.showData.dataSet[p.widgetKey] ? state.showData.dataSet[p.widgetKey][targetStock] : {}
            const lookupNames: Object = {}
            for (const s in widgetData) {
                const stockKey = `${p.defaultExchange}-${widgetData[s]}`
                const name = exchangeData && exchangeData[stockKey] ? exchangeData[stockKey].description : ''
                lookupNames[stockKey] = name
            }
            return (lookupNames)
        } else if (updateExchange === 0) {
            // console.log('updating exchange')
            setUpdateExchange(1)
            dispatch(tGetSymbolList({ exchange: p.defaultExchange, apiKey: p.apiKey, finnHubQueue: p.finnHubQueue }))
        }
    })


    useImperativeHandle(ref, () => (
        //used to copy widgets when being dragged. example: if widget body renders time series data into chart, copy chart data.
        //add additional slices of state to list if they help reduce re-render time.
        {
            state: {
                stockData: stockData,
                targetStock: targetStock, //REMOVE IF NO TARGET STOCK
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
                key: p.widgetKey,
                securityList: [[`${targetStock}`]]
            }
            // console.log(payload)
            dispatch(rBuildVisableData(payload))
        }
    }, [targetStock, p.widgetKey, widgetCopy, dispatch])

    useEffect(() => {
        //DELETE IF NO TARGET STOCK
        //if stock not selected default to first stock.
        if (Object.keys(p.trackedStocks).length > 0 && targetStock === '') {
            const setDefault = p.trackedStocks[Object.keys(p.trackedStocks)[0]].key
            setTargetStock(setDefault)
        }
    }, [p.trackedStocks, targetStock])

    useEffect(() => { //on update to redux data, update widget stock data, as long as data passes typeguard.
        if (isFinnHubData(rShowData) === true) {
            setStockData(rShowData)
        } else { setStockData([]) }
    }, [rShowData])

    function getStockName(stock) {
        try {
            const stockName = rExchange !== undefined ? rExchange[stock] : ''
            return stockName
        } catch {
            // console.log('cant find stock', stock)
            return " "
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
                        data-testid={`remove-${el}`}
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

        let stockTable = (
            <table>
                <tbody>{stockListRows}</tbody>
            </table>
        );
        return stockTable
    }

    function changeStockSelection(e) { //DELETE IF no target stock
        const target = e.target.value;
        const key = `${p.widgetKey}-${target}`
        setTargetStock(target)
        dispatch(tSearchMongoDB([key]))
    }

    function renderStockData() {
        const stockDataRows = stockData.map((el) =>
            <tr key={el + "row"}>
                <td key={el + "symbol"}>{el}</td>
                {/* <td key={el + "name"}>{el}</td> */}
                <td key={el + "name"}>{getStockName(`${p.defaultExchange}-${el}`)}</td>
            </tr>
        )
        const newSymbolList = Object.keys(p.trackedStocks).map((el) => (
            <option key={el + "ddl"} value={el}>
                {p.trackedStocks[el].dStock(p.exchangeList)}
            </option>
        ))
        return <>
            <select className="btn" value={targetStock} onChange={changeStockSelection}>
                {newSymbolList}
            </select>
            <table>
                <thead><tr><td>Symbol</td><td>Description</td></tr></thead>
                <tbody>
                    {stockDataRows}
                </tbody>
            </table>
        </>
    }


    return (
        <div data-testid='peersBody'>
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

export default forwardRef(FundamentalsPeers)

export function peersProps(that, key = "newWidgetNameProps") {
    let propList = {
        apiKey: that.props.apiKey,
        defaultExchange: that.props.defaultExchange,
        exchangeList: that.props.exchangeList,
        filters: that.props.widgetList[key]["filters"],
        showPane: that.showPane,
        trackedStocks: that.props.widgetList[key]["trackedStocks"],
        updateDefaultExchange: that.props.updateDefaultExchange,
        updateGlobalStockList: that.props.updateGlobalStockList,
        updateWidgetStockList: that.props.updateWidgetStockList,
        widgetKey: key,
        finnHubQueue: that.props.finnHubQueue
    };
    return propList;
}


