import * as React from "react"
import { useState, useEffect, forwardRef, useRef } from "react";

import { useAppDispatch, useAppSelector } from '../../../hooks';
import { rBuildVisableData } from '../../../slices/sliceShowData'
import { tSearchMongoDB } from '../../../thunks/thunkSearchMongoDB'
import { convertCamelToProper } from '../../../appFunctions/stringFunctions'

import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";
import CreateTimeSeriesChart, { createOptions } from './createTimeSeriesChart'

import { useDragCopy } from '../../widgetHooks/useDragCopy'
import { useTargetSecurity } from '../../widgetHooks/useTargetSecurity'
import { useSearchMongoDb } from '../../widgetHooks/useSearchMongoDB'



const useDispatch = useAppDispatch
const useSelector = useAppSelector

export interface Annual {
    annual: object
}

export interface FinnHubAPIData { //rename
    filters: object,
    metric: object,
    metricKeys: string[],
    series: Annual,
    seriesKeys: string[],
}

export interface FinnHubAPIDataArray {
    [index: number]: FinnHubAPIData
}

//add any additional type guard functions here used for live code.
function isFinnHubData(arg: any): arg is FinnHubAPIDataArray { //typeguard
    if (arg !== undefined && Object.keys(arg).length > 0 && arg[Object.keys(arg)[0]].filters) {
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
    const [stockData, setStockData] = useState(startingstockData()); //metric & series data for each stock.
    const [metricList, setMetricList] = useState(startMetricList()); //metricList target stocks available metrics
    const [seriesList, setSeriesList] = useState(startMetricList()); //metricList target stocks available metrics
    const [metricIncrementor, setMetricIncrementor] = useState(1);
    const [orderView, setOrderView] = useState(0);
    const [symbolView, setSymbolView] = useState(0);
    const dispatch = useDispatch(); //allows widget to run redux actions.

    const rShowData = useSelector((state) => { //REDUX Data associated with this widget.
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false' &&
            state.showData.dataSet[p.widgetKey] !== undefined) {
            const returnData = state.showData.dataSet[p.widgetKey]
            return (returnData)
        }
    })

    useDragCopy(ref, {
        stockData: stockData,
        metricList: metricList,
        metricIncrementor: metricIncrementor,
        orderView: orderView,
        symbolView: symbolView,
        targetSeries: '',
    })//useImperativeHandle. Saves state on drag. Dragging widget pops widget out of component array causing re-render as new component.
    useTargetSecurity(p.widgetKey, p.trackedStocks, p.updateWidgetConfig, p?.config?.targetSecurity,) //sets target security for widget on mount and change to security focus from watchlist.
    useSearchMongoDb(p.config.targetSecurity, p.widgetKey, dispatch) //on change to target security retrieve fresh data from mongoDB

    useEffect(() => { //set default series 
        if (seriesList.length > 0 && !p.config.targetSeries) {
            const updateWidgetConf = p.updateWidgetConfig
            updateWidgetConf(p.widgetKey, { targetSeries: seriesList[0], })
        }
    }, [seriesList, p.updateWidgetConfig, p.config.targetSeries, p.widgetKey])

    useEffect(() => { //build config setup
        console.log('BUILDING VISABLE DATA')
        let stockList = Object.keys(p.trackedStocks)
        let securityList: string[] = []
        let filterObj = {}

        if (p.config.toggleMode === 'metrics') {
            securityList = stockList
            for (const s of stockList) {
                filterObj[s] = {
                    filterPaths: ['metric', 'series.annual'],
                    showsData: [],
                    widgetType: 'FundamentalsBasicFinancials'
                }
                if (p.config.metricSelection) {
                    for (const f of p.config.metricSelection) {
                        filterObj[s].showsData.push(`metric.${f}`)
                    }
                }
            }
        } else { //if Time Series
            securityList.push(p.config.targetSecurity)
            filterObj[p.config.targetSecurity] = {}
            filterObj[p.config.targetSecurity] = {
                filterPaths: ['metric', 'series.annual'],
                showsData: [],
                widgetType: 'FundamentalsBasicFinancials'
            }
            if (p?.config?.seriesSelection) {
                for (const f of p?.config?.seriesSelection) {
                    filterObj?.[p.config.targetSecurity]?.showsData.push(`series.annual.${f}`)
                }
            }
        }

        const payload: object = {
            key: p.widgetKey,
            securityList: securityList,
            dataFilters: filterObj
        }
        console.log('payload paramas', p.widgetKey, securityList, filterObj)
        console.log('visable payload', payload)
        dispatch(rBuildVisableData(payload))

    }, [p.widgetKey, widgetCopy, dispatch, p.trackedStocks, p.config.metricSelection, p.config.seriesSelection, p.config.targetSecurity, p.config.toggleMode])

    useEffect((key: number = p.widgetKey, trackedStock = p.trackedStocks, keyList: string[] = Object.keys(p.trackedStocks), updateWidgetConfig: Function = p.updateWidgetConfig) => {
        //Setup default metric source if none selected.
        if (p.config.targetSecurity === undefined) {
            const newSource: string = keyList.length > 0 ? trackedStock[keyList[0]].key : ''
            updateWidgetConfig(key, {
                targetSecurity: newSource,
                metricSelection: [],
                seriesSelection: [],
                toggleMode: 'metrics',
            })
        }
    }, [p.updateWidgetConfig, p.widgetKey, p.trackedStocks, p.apiKey, p.config.targetSecurity])

    useEffect(() => { //on update to redux data, update widget stock data, as long as data passes typeguard.
        if (isFinnHubData(rShowData) === true) {
            const newData: FinnHubAPIDataArray = {}
            for (const node in rShowData) {
                newData[node] = {
                    metrics: {},
                    series: {},
                }
                if (rShowData?.[node]?.['metric']) { newData[node].metrics = rShowData[node]['metric'] }
                if (rShowData?.[node]?.['series']?.['annual']) newData[node].series = rShowData[node]['series']['annual']
            }
            setStockData(newData)
        } else {
            // console.log('does not pass guard')
            setStockData({})
        }
    }, [rShowData])

    useEffect(() => { //sets up lists used in widget configuration menu.
        if (stockData[p?.config?.targetSecurity] && rShowData && p?.config?.targetSecurity && rShowData[p?.config?.targetSecurity]) {
            if (rShowData?.[p.config.targetSecurity]?.['metricKeys']) setMetricList(rShowData?.[p.config.targetSecurity]?.['metricKeys'])
            if (rShowData?.[p.config.targetSecurity]?.['seriesKeys']) setSeriesList(rShowData?.[p.config.targetSecurity]?.['seriesKeys'])
        }
    }, [stockData, p.config.targetSecurity, rShowData])

    useEffect(() => {//refresh data on change to filters.
        let searchList = Object.keys(p.trackedStocks).map((el) => `${p.widgetKey}-${el}`)
        dispatch(tSearchMongoDB(searchList))
    }, [p.config.toggleMode, p.config.targetSecurity, p.config.metricSelection, p.config.seriesSelection, dispatch, p.trackedStocks, p.widgetKey])

    function setTargetSeries(el) {
        p.updateWidgetConfig(p.widgetKey, { targetSeries: el, })
    }


    function setToggleMode(el) {
        p.updateWidgetConfig(p.widgetKey, {
            toggleMode: el,
        })
    }

    function changeSource(el) {
        p.updateWidgetConfig(p.widgetKey, {
            targetSecurity: el,
        })
    }

    function changeOrder(indexRef, change, update) {
        let moveFrom = p.config[update][indexRef]
        let moveTo = p.config[update][indexRef + change]
        let orderMetricSelection = p.config[update].slice()
        orderMetricSelection[indexRef] = moveTo
        orderMetricSelection[indexRef + change] = moveFrom
        if (indexRef + change >= 0 && indexRef + change < p.config[update].length) {
            console.log('updating')
            p.updateWidgetConfig(p.widgetKey, {
                [update]: orderMetricSelection
            })
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
        } else {
            let newSelection = p.config.metricSelection.slice()
            newSelection.splice(newSelection.indexOf(metric), 1)
            p.updateWidgetConfig(p.widgetKey, { metricSelection: newSelection })
        }
    }

    function selectSeries(series) {
        if (p.config.seriesSelection.indexOf(series) < 0) {
            let newSelection = p.config.seriesSelection.slice()
            newSelection.push(series)
            p.updateWidgetConfig(p.widgetKey, { seriesSelection: newSelection })
        } else {
            let newSelection = p.config.seriesSelection.slice()
            newSelection.splice(newSelection.indexOf(series), 1)
            p.updateWidgetConfig(p.widgetKey, { seriesSelection: newSelection })
        }
    }

    function getMetrics() {
        let metricSelector = (
            <>
                <div>
                    <table>
                        <thead>
                            <tr>
                                <td>Metrics</td>
                                <td>Series</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><input type='radio' name='widgetToggle' checked={p.config.toggleMode === 'metrics'} onChange={() => setToggleMode('metrics')} /></td>
                                <td><input type='radio' name='widgetToggle' checked={p.config.toggleMode === 'series'} onChange={() => setToggleMode('series')} /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
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
                    <button data-testid='symbolViewSelector' onClick={() => { console.log('HERE'); symbolView === 1 ? setSymbolView(0) : setSymbolView(1) }}>
                        {symbolView === 0 ? 'Stocks' : 'Metrics'}
                    </button>
                </div>
                <div>{metricsTable()}</div>
            </>)
        return metricSelector
    }

    function checkStatus(check) {
        //sets status of check boxes when selecting or deselecting checkboxes.
        if (p.config.toggleMode === 'metrics') {
            if (p.config.metricSelection.indexOf(check) > -1) {
                return true
            } else {
                return false
            }
        } else {
            if (p.config.seriesSelection.indexOf(check) > -1) {
                return true
            } else {
                return false
            }
        }
    }

    function metricsTable() {
        if (p.config.metricSelection !== undefined) {
            let increment = 10 * metricIncrementor;
            let start = increment - 10;
            let end = increment;
            let metricSlice = metricList.slice(start, end);
            let seriesSlice = seriesList.slice(start, end);
            let metricSelectionSlice = p.config.metricSelection.slice(start, end);
            let seriesSelectionSlice = p.config.seriesSelection.slice(start, end);
            let stockSelectionSlice = Object.keys(p.trackedStocks).slice(start, end);
            let mapMetrics = metricSlice.map((el, index) => (
                <tr key={el + "metricRow" + index}>
                    <td key={el + "metricdesc"}>{convertCamelToProper(el)}</td>
                    <td key={el + "metricSelect"}>
                        <input type="checkbox" key={el + "checkbox"} onChange={() => selectMetrics(el)} checked={checkStatus(el)} />
                    </td>
                </tr>
            ));

            let mapSeries = seriesSlice.map((el, index) => (
                <tr key={el + "metricRow" + index}>
                    <td key={el + "metricdesc"}>{convertCamelToProper(el)}</td>
                    <td key={el + "metricSelect"}>
                        <input type="checkbox" key={el + "checkbox"} onChange={() => selectSeries(el)} checked={checkStatus(el)} />
                    </td>
                </tr>
            ));

            let mapMetricSelection = metricSelectionSlice.map((el, index) => (
                <tr key={el + "metricRow" + index}>
                    <td key={el + "metricdesc"}>{convertCamelToProper(el)}</td>
                    <td key={el + "up"}>
                        <button onClick={() => changeOrder(index, -1, 'metricSelection')}><i className="fa fa-sort-asc" aria-hidden="true"></i></button>
                    </td>
                    <td key={el + "down"}>
                        <button onClick={() => changeOrder(index, 1, 'metricSelection')}><i className="fa fa-sort-desc" aria-hidden="true"></i></button>
                    </td>
                </tr>
            ));

            let mapSeriesSelection = seriesSelectionSlice.map((el, index) => (
                <tr key={el + "metricRow" + index}>
                    <td key={el + "metricdesc"}>{convertCamelToProper(el)}</td>
                    <td key={el + "up"}>
                        <button onClick={() => changeOrder(index, -1, 'seriesSelection')}><i className="fa fa-sort-asc" aria-hidden="true"></i></button>
                    </td>
                    <td key={el + "down"}>
                        <button onClick={() => changeOrder(index, 1, 'seriesSelection')}><i className="fa fa-sort-desc" aria-hidden="true"></i></button>
                    </td>
                </tr>
            ));

            let mapStockSelection = stockSelectionSlice.map((el, index) => (
                <tr key={el + "metricRow" + index}>
                    <td key={el + "metricdesc"}>{p.trackedStocks[el].dStock(p.exchangeList)}</td>
                    <td><input type='radio' name='sourceStock' checked={p.config.targetSecurity === el} onChange={() => changeSource(el)} /></td>
                    <td key={el + "remove"}>
                        <button data-testid={`remove-${el}`} onClick={() => { updateWidgetList(el); }}><i className="fa fa-times" aria-hidden="true" /></button>
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
                    if (p.config.toggleMode === 'metrics') {
                        return (
                            <>
                                <td data-testid='metricSelector'>Metric</td>
                                <td>Select</td>
                            </>
                        )
                    } else {
                        return (
                            <>
                                <td data-testid='timeSeriesSelector'>Time Series</td>
                                <td>Select</td>
                            </>
                        )
                    }
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
                            {orderView === 0 && symbolView === 0 && p.config.toggleMode === 'metrics' && mapMetrics}
                            {orderView === 1 && symbolView === 0 && p.config.toggleMode === 'metrics' && mapMetricSelection}
                            {orderView === 0 && symbolView === 0 && p.config.toggleMode === 'series' && mapSeries}
                            {orderView === 1 && symbolView === 0 && p.config.toggleMode === 'series' && mapSeriesSelection}
                            {symbolView === 1 && mapStockSelection}
                        </tbody>
                    </table>
                </div>
            );
            return metricSelectTable;
        }
    }

    function updateWidgetList(stock) {
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
        let returnMetrics: string[] = []
        for (const x in findMetrics) {
            try {
                let metric: string | number = symbolData[p.config.toggleMode][findMetrics[x]]
                returnMetrics.push(metric.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }))
            } catch (err) {
                // console.log('error rendering stock data', err)
            }
        }
        let thisKey = p.widgetKey
        let thisMetricList = returnMetrics.map((el, ind) => <td className="rightTE" key={thisKey + el + ind + "dat"}>{el}</td>)
        return thisMetricList
    }

    function changeBodySelection(e) {
        const target = e.target.value;
        setToggleMode(target)
    }

    function bodySelector() {
        return (
            <select data-testid='modeSelector' className="btn" value={p.config.toggleMode} onChange={changeBodySelection}>
                <option data-testid='selectMetrics' key={'metricsSelection1'} value={'metrics'}>
                    metrics
                </option>
                <option data-testid='selectSeries' key={'metricsSelection2'} value={'series'}>
                    series
                </option>
            </select>
        )
    }

    function changeStockSelection(e) { //DELETE IF no target stock
        const target = e.target.value;
        p.updateWidgetConfig(p.widgetKey, {
            targetSecurity: target,
        })
    }

    function changeSeriesSelection(e) {
        const target = e.target.value;
        setTargetSeries(target)
    }

    let stockSymbolList = Object.keys(p.trackedStocks).map((el) => (
        <option data-testid={`select-${el}`} key={el + "option"} value={el}>
            {p.trackedStocks[el].dStock(p.exchangeList)}
        </option>
    ));

    let seriesListOptions = p.config.seriesSelection ? p.config.seriesSelection.map((el) => (
        <option key={el + "option"} value={el}>
            {convertCamelToProper(el)}
        </option>
    )) : <></>;

    function renderStockData() {
        if (p.config.toggleMode === 'metrics') { //build metrics table.
            let selectionList: string[] = []
            let thisKey = p.widgetKey
            selectionList = []
            if (p.config.metricSelection) { selectionList = p.config.metricSelection.slice() }
            let headerRows = selectionList.map((el) => {
                let title = el.replace(/([A-Z])/g, ' $1').trim().split(" ").join("\n")
                if (title.search(/\d\s[A-Z]/g) !== -1) {
                    title = title.slice(0, title.search(/\d\s[A-Z]/g) + 1) + '-' + title.slice(title.search(/\d\s[A-Z]/g) + 2)
                }
                title = title.replace(/T\sT\sM/g, 'TTM')
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
            let buildTableMetrics = (
                <div data-testid='metricsSelectors' className="widgetTableDiv">
                    {bodySelector()}

                    <table className='widgetBodyTable'>
                        <thead>
                            <tr>
                                <td data-testid='symbolLabel' className='centerBottomTE'>Symbol:</td>
                                {headerRows}
                            </tr>
                        </thead>
                        <tbody>
                            {bodyRows}
                        </tbody>
                    </table>
                </div>
            )
            return buildTableMetrics
        } else { //build time series chart
            let stockDataObj = stockData?.[p.config.targetSecurity]?.['series']?.[p.config.targetSeries] ? stockData[p.config.targetSecurity]['series'][p.config.targetSeries] : []
            const options = createOptions(convertCamelToProper(p.config.targetSeries), stockDataObj)
            let buildChartSelection = (
                <div data-testid='seriesSelectors' className="widgetTableDiv">
                    Show: {bodySelector()} <br />
                    Stock: {
                        <select data-testid='selectStock' className="btn" value={p.config.targetSecurity} onChange={changeStockSelection}>
                            {stockSymbolList}
                        </select>
                    } <br />
                    Series: {
                        <select className="btn" value={p.config.targetSeries} onChange={changeSeriesSelection}>
                            {seriesListOptions}
                        </select>
                    }
                    <CreateTimeSeriesChart candleData={options} />
                </div>
            )
            return buildChartSelection;
        }
    }

    return (
        <div data-testid='basicFinancialsBody'>
            {p.showEditPane === 1 && (
                <>
                    {React.createElement(StockSearchPane, searchPaneProps(p))}
                    {getMetrics()}
                </>
            )}
            {Object.keys(p.trackedStocks).length > 0 && p.showEditPane === 0 ? renderStockData() : <></>}
        </div>
    );
}

export default forwardRef(FundamentalsBasicFinancials)

export function metricsProps(that, key = "newWidgetNameProps") {
    let propList = {
        apiKey: that.props.apiKey,
        defaultExchange: that.props.defaultExchange,
        exchangeList: that.props.exchangeList,
        filters: that.props.widgetList[key]["filters"],
        showPane: that.showPane,
        targetSecurity: that.props.targetSecurity,
        trackedStocks: that.props.widgetList[key]["trackedStocks"],
        updateWidgetConfig: that.props.updateWidgetConfig,
        updateDefaultExchange: that.props.updateDefaultExchange,
        updateGlobalStockList: that.props.updateGlobalStockList,
        updateWidgetStockList: that.props.updateWidgetStockList,
        widgetKey: key,

    };
    return propList;
}


