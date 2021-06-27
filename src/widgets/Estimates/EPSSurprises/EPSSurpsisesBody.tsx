import * as React from "react"
import { useState, useEffect, forwardRef, useRef, useMemo } from "react";
import ReactChart from "./reactChart";

import { useAppDispatch, useAppSelector } from '../../../hooks';
import { tSearchMongoDB } from '../../../thunks/thunkSearchMongoDB'

import { useDragCopy } from '../../widgetHooks/useDragCopy'
import { useTargetSecurity } from '../../widgetHooks/useTargetSecurity'
import { useSearchMongoDb } from '../../widgetHooks/useSearchMongoDB'
import { useBuildVisableData } from '../../widgetHooks/useBuildVisableData'


import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";

const useDispatch = useAppDispatch
const useSelector = useAppSelector

interface FinnHubAPIData { //rename
    actual: number,
    estimate: number,
    period: string, //YYYY-MM-DD
    symbol: string,
}

export interface FinnHubAPIDataArray {
    [index: number]: FinnHubAPIData
}

interface dataListObject {
    x: Date,
    y: string
}

function isFinnHubData(arg: any): arg is FinnHubAPIDataArray { //typeguard
    if (arg !== undefined && Object.keys(arg).length > 0 && arg[0] && arg[0].actual !== undefined) {
        return true
    } else {
        return false
    }
}
//RENAME FUNCTION
function EstimatesEPSSurprises(p: { [key: string]: any }, ref: any) {
    const isInitialMount = useRef(true); //update to false after first render.

    const startingstockData = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
                const stockData = JSON.parse(JSON.stringify(p.widgetCopy.stockData))
                return (stockData)
            } else if (p?.config?.targetSecurity) {
                return (p?.config?.targetSecurity)
            } else {
                return ('')
            }
        }
    }

    const startingWidgetCoptyRef = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy !== undefined && p.widgetCopy.widgetID !== null) {
                return p.widgetCopy.widgetID
            } else { return -1 }
        }
    }

    const [stockData, setStockData] = useState(startingstockData());
    const [chartOptions, setChartOptions] = useState({})
    const [widgetCopy] = useState(startingWidgetCoptyRef())
    const dispatch = useDispatch(); //allows widget to run redux actions.

    const rShowData = useSelector((state) => { //REDUX Data associated with this widget.
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false' &&
            state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData: object = state.showData.dataSet[p.widgetKey][p.config.targetSecurity]
            return (showData)
        }
    })

    const focusSecurityList = useMemo(() => { //remove if all securities should stay in focus.
        return [p?.config?.targetSecurity]
    }, [p?.config?.targetSecurity])

    useDragCopy(ref, { chartOptions: chartOptions, stockData: stockData, })//useImperativeHandle. Saves state on drag. Dragging widget pops widget out of component array causing re-render as new component.
    useTargetSecurity(p.widgetKey, p.trackedStocks, p.updateWidgetConfig, p?.config?.targetSecurity,) //sets target security for widget on mount and change to security focus from watchlist.
    useSearchMongoDb(p.config.targetSecurity, p.widgetKey, dispatch) //on change to target security retrieve fresh data from mongoDB
    useBuildVisableData(focusSecurityList, p.widgetKey, widgetCopy, dispatch, isInitialMount) //rebuild visable data on update to target security

    useEffect(() => { //on update to redux data, update widget stock data, as long as data passes typeguard.
        if (isFinnHubData(rShowData) === true) {
            // console.log('passes typeguard')
            setStockData(rShowData)
        } else {
            // console.log('does not pass typeguard')
            setStockData([])
        }
    }, [rShowData])

    useEffect(() => { //create data chart
        // console.log('stock data updated, created chart objects.')
        const actualList: dataListObject[] = []
        const estimateList: dataListObject[] = []

        for (const i in stockData) {
            const n = stockData
            actualList.push({ 'x': new Date(n[i]['period']), 'y': n[i]['actual'] })
            estimateList.push({ 'x': new Date(n[i]['period']), 'y': n[i]['estimate'] })
        }

        const chartData = {
            actual: actualList,
            estimate: estimateList,
        }
        // console.log("new chart data", chartData)

        const options = {
            width: 400,
            height: 200,
            theme: "light2",
            animationEnabled: true,
            exportEnabled: true,
            title: {
                text: `${p.config.targetSecurity}: EPS Surprises'`
            },
            axisX: {
                title: ""
            },
            axisY: {
                title: "Quarterly EPS",
                suffix: ""
            },
            legend: {
                cursor: "pointer",
                itemclick: 'toggleDataSeries'
            },
            data: [{
                type: "scatter",
                name: "Actual",
                markerType: "circle",
                showInLegend: true,
                // toolTipContent: "<span style=\"color:#4F81BC \">{name}</span><br>Active Users: {x}<br>CPU Utilization: {y}%",
                dataPoints: chartData.actual
            },
            {
                type: "scatter",
                name: "Estimate",
                markerType: "cross",
                showInLegend: true,
                // toolTipContent: "<span style=\"color:#4F81BC \">{name}</span><br>Active Users: {x}<br>CPU Utilization: {y}%",
                dataPoints: chartData.estimate
            }]
        }
        setChartOptions(options);

    }, [stockData, p.config.targetSecurity])

    function changeStockSelection(e) { //DELETE IF no target stock
        const target = e.target.value;
        const key = `${p.widgetKey}-${target}`
        p.updateWidgetConfig(p.widgetKey, {
            targetSecurity: target,
        })
        dispatch(tSearchMongoDB([key]))
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

        let stockTable = (
            <table>
                <tbody>{stockListRows}</tbody>
            </table>
        );
        return stockTable
    }

    function renderStockData() {
        let newSymbolList = Object.keys(p.trackedStocks).map((el) => (
            <option key={el + "ddl"} value={el}>
                {p.trackedStocks[el].dStock(p.exchangeList)}
            </option>
        ));

        let chartBody = (
            <>
                <div data-testid="SelectionLabel" className="div-inline" >
                    <select className="btn" value={p.config.targetSecurity} onChange={changeStockSelection}>
                        {newSymbolList}
                    </select>
                </div>
                <div className="graphDiv" data-testid={`EPSChart`}>
                    <ReactChart chartOptions={chartOptions} />
                </div>
            </>
        );
        return chartBody;
    }

    return (
        <div data-testid="EPSSuprisesBody">
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

export default forwardRef(EstimatesEPSSurprises)

export function EPSSurprisesProps(that, key = "newWidgetNameProps") {
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
        updateWidgetConfig: that.props.updateWidgetConfig,
        widgetKey: key,
        targetSecurity: that.props.targetSecurity,
    };
    return propList;
}
