import * as React from "react"
import { useState, useEffect, forwardRef, useRef, useMemo } from "react";
import RecTrendChart from "./recTrendChart";

import { createSelector } from 'reselect'
import { storeState } from './../../../store'

import { useAppDispatch, useAppSelector } from '../../../hooks';

import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";

import { useDragCopy } from './../../widgetHooks/useDragCopy'

import { useSearchMongoDb } from './../../widgetHooks/useSearchMongoDB'
import { useBuildVisableData } from './../../widgetHooks/useBuildVisableData'
import { useUpdateFocus } from './../../widgetHooks/useUpdateFocus'

import { dStock } from './../../../appFunctions/formatStockSymbols'

const useDispatch = useAppDispatch
const useSelector = useAppSelector

export interface FinnHubAPIData {
    symbol: string,
    buy: number,
    hold: number,
    period: string,
    sell: number,
    strongBuy: number,
    strongSell: number,
}

export interface FinnHubAPIDataArray {
    [index: number]: FinnHubAPIData
}

interface DataChartObject {
    strongSell: object,
    sell: object,
    hold: object,
    buy: object,
    strongBuy: object,
}

function EstimatesRecommendationTrends(p: { [key: string]: any }, ref: any) {
    const isInitialMount = useRef(true); //update to false after first render.

    const startingWidgetCoptyRef = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy !== undefined && p.widgetCopy.widgetID !== null) {
                return p.widgetCopy.widgetID
            } else { return -1 }
        }
    }

    const [widgetCopy] = useState(startingWidgetCoptyRef())
    const [chartOptions, setchartOptions] = useState({})
    const dispatch = useDispatch(); //allows widget to run redux actions.

    const showDataSelector = createSelector(
        (state: storeState) => state.showData.dataSet[p.widgetKey][p.config.targetSecurity],
        returnValue => returnValue
    )

    const rShowData = useSelector((state) => { //REDUX Data associated with this widget.
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false' &&
            state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData: any = showDataSelector(state)
            return (showData)
        }
    })

    const focusSecurityList = useMemo(() => { //remove if all securities should stay in focus.
        return [p?.config?.targetSecurity]
    }, [p?.config?.targetSecurity])

    useDragCopy(ref, { chartOptions: chartOptions })// stockData: JSON.parse(JSON.stringify(stockData)),   useImperativeHandle. Saves state on drag. Dragging widget pops widget out of component array causing re-render as new component.
    useUpdateFocus(p.targetSecurity, p.updateWidgetConfig, p.widgetKey) //sets security focus in config. Used for redux.visable data and widget excel templating.	
    useSearchMongoDb(p.config.targetSecurity, p.widgetKey, widgetCopy, dispatch, isInitialMount) //on change to target security retrieve fresh data from mongoDB
    useBuildVisableData(focusSecurityList, p.widgetKey, widgetCopy, dispatch, isInitialMount) //rebuild visable data on update to target security

    useEffect(() => {//create chart data
        const sOptions = ['strongSell', 'sell', 'hold', 'buy', 'strongBuy']
        const chartData: DataChartObject = { strongSell: {}, sell: {}, hold: {}, buy: {}, strongBuy: {} }
        for (const i in sOptions) {
            chartData[sOptions[i]] = {
                type: "stackedColumn",
                name: sOptions[i],
                showInLegend: "true",
                xValueFormatString: "DD, MMM",
                yValueFormatString: "#,##0",
                dataPoints: [] //populated by loop below
            }
        }
        const listSixData = Array.isArray(rShowData) === true ? rShowData.slice(0, 12) : []
        const rawData = listSixData
        for (const i in rawData) {
            const node = rawData[i]
            for (const d in sOptions) {
                const dataPoint = node[sOptions[d]]
                const dataTime = node['period']
                const dataObject = { label: dataTime, y: dataPoint }
                chartData[sOptions[d]]['dataPoints'].unshift(dataObject)
            }
        }

        const dataArray: DataChartObject[] = []

        const options = {
            width: 400,
            height: 200,
            animationEnabled: true,
            exportEnabled: true,
            theme: "light1",
            title: {
                text: p.config.targetSecurity,
                fontFamily: "verdana"
            },
            axisY: {
                title: "",
                includeZero: true,
                prefix: "",
                suffix: ""
            },
            toolTip: {
                shared: true,
                reversed: true
            },
            legend: {
                verticalAlign: "center",
                horizontalAlign: "right",
                reversed: true,
                cursor: "pointer",
                // itemclick: toggleDataSeries
            },
            data: dataArray
        }

        for (const x in chartData) {
            options.data.push(chartData[x])
        }

        setchartOptions(options)

    }, [rShowData, p.config.targetSecurity])

    function renderSearchPane() {

        const stockList = Object.keys(p.trackedStocks);
        const stockListRows = stockList.map((el) =>
            <tr key={el + "container"}>
                <td className="centerTE" key={el + "buttonC"}>
                    <button
                        data-testid={`remove-${el}`}
                        key={el + "button"}
                        onClick={() => {
                            p.updateWidgetList(el);
                        }}
                    >
                        <i className="fa fa-times" aria-hidden="true" key={el + "icon"}></i>
                    </button>
                </td>
                <td className='centerTE' key={el + "name"}>{dStock(p.trackedStocks[el], p.exchangeList)}</td>
                <td className='leftTE'>{p.trackedStocks[el].description}</td>

            </tr>
        )

        let stockTable = (
            <div className='scrollableDiv'>
                <table className='dataTable'>
                    <thead>
                        <tr>
                            <td>Remove</td>
                            <td>Symbol</td>
                            <td>Name</td>
                        </tr>
                    </thead>
                    <tbody>{stockListRows}</tbody>
                </table>
            </div>
        );
        return stockTable
    }

    function changeStockSelection(e) {
        const target = e.target.value;
        p.updateWidgetConfig(p.widgetKey, {
            targetSecurity: target,
        })
    }

    function renderStockData() {

        let newSymbolList = Object.keys(p.trackedStocks).map((el) => (
            <option key={el + "ddl"} value={el}>
                {dStock(p.trackedStocks[el], p.exchangeList)}
            </option>
        ));

        let chartBody = (
            <div data-testid='recTrendBody'>
                <div className="div-stack">
                    <select data-testid='recTrendDropdown' className="btn" value={p.config.targetSecurity} onChange={changeStockSelection}>
                        {newSymbolList}
                    </select>
                </div>
                <div className="graphDiv">
                    <RecTrendChart chartOptions={chartOptions} />
                </div>
            </div>
        );
        return chartBody;
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

export default forwardRef(EstimatesRecommendationTrends)

export function recommendationTrendsProps(that, key = "newWidgetNameProps") {
    let propList = {
        apiKey: that.props.apiKey,
        defaultExchange: that.props.defaultExchange,
        exchangeList: that.props.exchangeList,
        filters: that.props.widgetList[key]["filters"],
        trackedStocks: that.props.widgetList[key]["trackedStocks"],
        updateWidgetStockList: that.props.updateWidgetStockList,
        updateWidgetConfig: that.props.updateWidgetConfig,
        widgetKey: key,
        targetSecurity: that.props.targetSecurity,
    };
    return propList;
}


