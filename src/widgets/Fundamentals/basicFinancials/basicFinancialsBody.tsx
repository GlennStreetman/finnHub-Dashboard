import * as React from "react"
import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";

import { useAppDispatch, useAppSelector } from '../../../hooks';
import { rBuildVisableData } from '../../../slices/sliceShowData'
// import { tSearchMongoDB } from '../../../thunks/thunkSearchMongoDB'

import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";

const useDispatch = useAppDispatch
const useSelector = useAppSelector

export interface FinnHubAPIData { //rename
    [index: string]: number | string
}

export interface FinnHubAPIDataArray {
    [index: number]: FinnHubAPIData
}

//add any additional type guard functions here used for live code.
function isFinnHubData(arg: any): arg is FinnHubAPIDataArray { //typeguard
    // console.log('!arg', arg)
    if (arg !== undefined && Object.keys(arg).length > 0 && arg[Object.keys(arg)[0]].symbol) {
        return true
    } else {
        return false
    }
}

function FundamentalsBasicFinancials(p: { [key: string]: any }, ref: any) {
    const isInitialMount = useRef(true); //update to false after first render.

    const startingstockData = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
                const copyData: FinnHubAPIDataArray = JSON.parse(JSON.stringify(p.widgetCopy.stockData))
                return (copyData)
            } else {
                const newData: FinnHubAPIDataArray = {}
                return (newData)
            }
        } else { return ({}) }
    }

    const startMetricList = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
                const copyData: string[] = JSON.parse(JSON.stringify(p.widgetCopy.metricList))
                return (copyData)
            } else {
                const newData: string[] = []
                return (newData)
            }
        } else { return ([]) }
    }

    const startingWidgetCoptyRef = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy !== undefined && p.widgetCopy.widgetID !== null) {
                return p.widgetCopy.widgetID
            } else { return -1 }
        }
    }

    const [widgetCopy] = useState(startingWidgetCoptyRef())
    const [stockData, setStockData] = useState(startingstockData()); //data for each stock.
    const [metricList, setMetricList] = useState(startMetricList()); //metricList target stocks available metrics
    const [metricIncrementor, setMetricIncrementor] = useState(1);
    const [orderView, setOrderView] = useState(0);
    const [symbolView, setSymbolView] = useState(0);
    const dispatch = useDispatch(); //allows widget to run redux actions.

    const rShowData = useSelector((state) => { //REDUX Data associated with this widget.
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false' &&
            state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData = state.showData.dataSet[p.widgetKey]
            return (showData)
        }
    })

    useImperativeHandle(ref, () => (
        //used to copy widgets when being dragged. example: if widget body renders time series data into chart, copy chart data.
        //add additional slices of state to list if they help reduce re-render time.
        {
            state: {
                stockData: stockData,
                metricList: metricList,
                metricIncrementor: metricIncrementor,
                orderView: orderView,
                symbolView: symbolView,
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
                securityList: Object.keys(p.trackedStocks)
            }
            dispatch(rBuildVisableData(payload))
        }
    }, [p.widgetKey, widgetCopy, dispatch, p.trackedStocks])

    useEffect((key: number = p.widgetKey, trackedStock = p.trackedStocks, keyList: string[] = Object.keys(p.trackedStocks), updateWidgetConfig: Function = p.updateWidgetConfig) => {
        //Setup default metric source if none selected.
        if (p.config.metricSource === undefined) {
            const newSource: string = keyList.length > 0 ? trackedStock[keyList[0]].key : ''
            updateWidgetConfig(key, {
                metricSource: newSource,
                metricSelection: []
            })
        }
    }, [p.updateWidgetConfig, p.widgetKey, p.trackedStocks, p.apiKey, p.config.metricSource])

    useEffect(() => { //on update to redux data, update widget stock data, as long as data passes typeguard.
        if (isFinnHubData(rShowData) === true) {
            const newData: FinnHubAPIDataArray = {}
            for (const node in rShowData) {
                newData[node] = rShowData[node]['metric']
            }
            setStockData(newData)
        } else { setStockData({}) }
    }, [rShowData])

    useEffect(() => {
        if (stockData[p.config.metricSource] !== undefined) {
            const newList = Object.keys(stockData[p.config.metricSource]) ?? []
            // p.updateWidgetconfig(p.apiKey, 'metricList', newList)
            setMetricList(newList)
        }
    }, [stockData, p.config.metricSource])

    function changeSource(el) {
        p.updateWidgetConfig(p.widgetKey, {
            metricList: [],
            metricSource: el,
        })
    }

    function changeOrder(indexRef, change) {
        //changes order that metric selections are displayed in.
        console.log(indexRef + ":" + change)
        let moveFrom = p.config.metricSelection[indexRef]
        let moveTo = p.config.metricSelection[indexRef + change]
        let orderMetricSelection = p.config.metricSelection.slice()
        orderMetricSelection[indexRef] = moveTo
        orderMetricSelection[indexRef + change] = moveFrom
        console.log(orderMetricSelection, moveFrom, moveTo, p.config.metricSelection.length)
        if (indexRef + change >= 0 && indexRef + change < p.config.metricSelection.length) {
            console.log('updating')
            p.updateWidgetConfig(p.widgetKey, {
                metricSelection: orderMetricSelection
            })
            // setMetricSelection(orderMetricSelection)
        }
    }

    function changeIncrememnt(e) {
        //pagination
        const newIncrement = metricIncrementor + e;
        if (newIncrement > 0 && newIncrement < metricList.length + 10) setMetricIncrementor(newIncrement)
    }

    function selectMetrics(metric) {
        if (p.config.metricSelection.indexOf(metric) < 0) {
            let newSelection = p.config.metricSelection.slice()
            newSelection.push(metric)
            p.updateWidgetConfig(p.widgetKey, { metricSelection: newSelection })
            // setMetricSelection(newSelection)
        } else {
            let newSelection = p.config.metricSelection.slice()
            newSelection.splice(newSelection.indexOf(metric), 1)
            p.updateWidgetConfig(p.widgetKey, { metricSelection: newSelection })
            // setMetricSelection(newSelection)
        }
    }

    function getMetrics() {
        let metricSelector = (
            <>
                <div>
                    <button onClick={() => changeIncrememnt(-1)}>
                        <i className="fa fa-backward" aria-hidden="true"></i>
                    </button>
                    <button onClick={() => changeIncrememnt(1)}>
                        <i className="fa fa-forward" aria-hidden="true"></i>
                    </button>
                    {symbolView === 0 && (
                        <button onClick={() => { orderView === 1 ? setOrderView(0) : setOrderView(1) }}>
                            {orderView === 0 ? 'Order' : 'Selection'}
                        </button>
                    )}
                    <button onClick={() => { symbolView === 1 ? setSymbolView(0) : setSymbolView(1) }}>
                        {symbolView === 0 ? 'Stocks' : 'Metrics'}
                    </button>
                </div>
                <div>{metricsTable()}</div>
            </>)
        return metricSelector
    }

    function checkStatus(check) {
        //sets status of check boxes when selecting or deselecting checkboxes.
        if (p.config.metricSelection.indexOf(check) > -1) {
            return true
        } else {
            return false
        }
    }

    function metricsTable() {
        if (p.config.metricSelection !== undefined) {
            let increment = 10 * metricIncrementor;
            let start = increment - 10;
            let end = increment;
            let metricSlice = metricList.slice(start, end);
            let selectionSlice = p.config.metricSelection.slice(start, end);
            let stockSelectionSlice = Object.keys(p.trackedStocks).slice(start, end);
            // console.log(selectionSlice)
            let mapMetrics = metricSlice.map((el, index) => (
                <tr key={el + "metricRow" + index}>
                    <td key={el + "metricdesc"}>{el}</td>
                    <td key={el + "metricSelect"}>
                        <input type="checkbox" key={el + "checkbox"} onChange={() => selectMetrics(el)} checked={checkStatus(el)} />
                    </td>
                </tr>
            ));

            let mapMetricSelection = selectionSlice.map((el, index) => (
                <tr key={el + "metricRow" + index}>
                    <td key={el + "metricdesc"}>{el}</td>
                    <td key={el + "up"}>
                        <button onClick={() => changeOrder(index, -1)}><i className="fa fa-sort-asc" aria-hidden="true"></i></button>
                    </td>
                    <td key={el + "down"}>
                        <button onClick={() => changeOrder(index, 1)}><i className="fa fa-sort-desc" aria-hidden="true"></i></button>
                    </td>
                </tr>
            ));

            let mapStockSelection = stockSelectionSlice.map((el, index) => (
                <tr key={el + "metricRow" + index}>
                    <td key={el + "metricdesc"}>{p.trackedStocks[el].dStock(p.exchangeList)}</td>
                    <td><input type='radio' name='sourceStock' checked={p.config.metricSource === el} onChange={() => changeSource(el)} /></td>
                    <td key={el + "remove"}>
                        <button onClick={() => { updateWidgetList(el); }}><i className="fa fa-times" aria-hidden="true" /></button>
                    </td>

                </tr>
            ));

            let metricSelectTableheading = () => {
                if (symbolView === 1) {
                    return (
                        <>
                            <td>Stock</td>
                            <td>Source</td>
                            <td>Remove</td>
                        </>
                    )
                } else if (orderView === 0) {
                    return (
                        <>
                            <td>Metric</td>
                            <td>Select</td>
                        </>
                    )
                } else {
                    return (
                        <>
                            <td>Metric</td>
                            <td>Up</td>
                            <td>Down</td>
                        </>
                    )
                }
            }
            let metricSelectTable = (
                <div className="widgetTableDiv">
                    <table className='widgetBodyTable'>
                        <thead>
                            <tr>
                                {metricSelectTableheading()}
                            </tr>
                        </thead>
                        <tbody>
                            {orderView === 0 && symbolView === 0 && mapMetrics}
                            {orderView === 1 && symbolView === 0 && mapMetricSelection}
                            {symbolView === 1 && mapStockSelection}
                        </tbody>
                    </table>
                </div>
            );
            return metricSelectTable;
        }
    }

    function updateWidgetList(stock) {
        // console.log("updating");
        if (stock.indexOf(":") > 0) {
            const stockSymbole = stock.slice(0, stock.indexOf(":"));
            p.updateWidgetStockList(p.widgetKey, stockSymbole);
        } else {
            p.updateWidgetStockList(p.widgetKey, stock);
        }
    }

    function mapStockData(symbol) {
        let symbolData = stockData[symbol]
        let findMetrics = p.config.metricSelection
        // console.log(findMetrics)
        let returnMetrics: string[] = []
        for (var x in findMetrics) {
            try {
                let metric: string | number = symbolData[findMetrics[x]]
                returnMetrics.push(metric.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }))
            } catch (err) {
                console.log('mapStockData err')
            }
        }
        // console.log(returnMetrics)
        let thisKey = p.widgetKey
        let thisMetricList = returnMetrics.map((el, ind) => <td className="rightTE" key={thisKey + el + ind + "dat"}>{el}</td>)
        return thisMetricList
    }

    function renderStockData() {
        let selectionList: string[] = []
        let thisKey = p.widgetKey
        if (p.config.metricSelection !== undefined) { selectionList = p.config.metricSelection.slice() }
        let headerRows = selectionList.map((el) => {
            let title = el.replace(/([A-Z])/g, ' $1').trim().split(" ").join("\n")
            if (title.search(/\d\s[A-Z]/g) !== -1) {
                title = title.slice(0, title.search(/\d\s[A-Z]/g) + 1) + '-' + title.slice(title.search(/\d\s[A-Z]/g) + 2)
            }
            // console.log(title)
            title = title.replace(/T\sT\sM/g, 'TTM')
            // console.log(title)
            return (<td className='tdHead' key={thisKey + el + "title"}>{title}</td>)
        }
        )
        let bodyRows = Object.keys(p.trackedStocks).map((el) => {
            return (
                <tr key={thisKey + el + "tr1"}>
                    <td key={thisKey + el + "td1"}>{p.trackedStocks[el].dStock(p.exchangeList)}</td>
                    {mapStockData(el)}
                </tr>
            )
        })
        let buildTable = <div className="widgetTableDiv">
            <table className='widgetBodyTable'>
                <thead>
                    <tr>
                        <td className='centerBottomTE'>Symbole:</td>
                        {headerRows}
                    </tr>
                </thead>
                <tbody>
                    {bodyRows}
                </tbody>
            </table>
        </div>

        return buildTable;
    }

    return (
        <>
            {p.showEditPane === 1 && (
                <>
                    {React.createElement(StockSearchPane, searchPaneProps(p))}
                    {getMetrics()}
                </>
            )}
            {Object.keys(p.trackedStocks).length > 0 && p.showEditPane === 0 ? renderStockData() : <></>}
        </>
    );
}
//RENAME
export default forwardRef(FundamentalsBasicFinancials)
//RENAME
export function metricsProps(that, key = "newWidgetNameProps") {
    let propList = {
        apiKey: that.props.apiKey,
        defaultExchange: that.props.defaultExchange,
        exchangeList: that.props.exchangeList,
        filters: that.props.widgetList[key]["filters"],
        showPane: that.showPane,
        trackedStocks: that.props.widgetList[key]["trackedStocks"],
        updateWidgetConfig: that.props.updateWidgetConfig,
        updateDefaultExchange: that.props.updateDefaultExchange,
        updateWidgetFilters: that.props.updateWidgetFilters,
        updateGlobalStockList: that.props.updateGlobalStockList,
        updateWidgetStockList: that.props.updateWidgetStockList,
        widgetKey: key,

    };
    return propList;
}


