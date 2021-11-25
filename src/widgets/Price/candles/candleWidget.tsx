import * as React from "react"
import { useState, useEffect, useMemo, forwardRef, useRef } from "react";

import { useAppDispatch, useAppSelector } from '../../../hooks';

import CreateCandleStickChart from "./createCandleStickChart";
import WidgetFilterDates from '../../../components/widgetFilterDates'
import ToolTip from './../../../components/toolTip.js'

import { useDragCopy } from './../../widgetHooks/useDragCopy'

import { useSearchMongoDb } from './../../widgetHooks/useSearchMongoDB'
import { useBuildVisableData } from './../../widgetHooks/useBuildVisableData'
import { useStartingFilters } from './../../widgetHooks/useStartingFilters'
import { useUpdateFocus } from './../../widgetHooks/useUpdateFocus'

import WidgetFocus from '../../../components/widgetFocus'
import WidgetRemoveSecurityTable from '../../../components/widgetRemoveSecurityTable'
import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";

import { UpdateWidgetFilters } from 'src/appFunctions/appImport/widgetLogic'

const useDispatch = useAppDispatch
const useSelector = useAppSelector

export interface FinnHubCandleData {
    c: number[],
    h: number[],
    l: number[],
    o: number[],
    s: string,
    t: number[],
    v: number[],
}

function isCandleData(arg: any): arg is FinnHubCandleData { //defined shape of candle data. CHeck used before rendering.
    return arg.c !== undefined
}

function PriceCandles(p: { [key: string]: any }, ref: any) {
    const isInitialMount = useRef(true); //update to false after first render.

    const startingCandleData = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
                const stockData = JSON.parse(JSON.stringify(p.widgetCopy.chartData))
                return (stockData)
            } else if (p?.config?.targetSecurity) {
                return (p?.config?.targetSecurity)
            } else {
                return ('')
            }
        }
    }

    const startingOptions = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
                const options = JSON.parse(JSON.stringify(p.widgetCopy.options))
                return (options)
            } else { return ({}) }
        }
    }

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


    const [widgetCopy] = useState(startingWidgetCoptyRef())
    const [chartData, setChartData] = useState(startingCandleData())
    const [options, setOptions] = useState(startingOptions())
    const [start, setStart] = useState(startingStartDate())
    const [end, setEnd] = useState(startingEndDate())
    const dispatch = useDispatch()

    const rShowData = useSelector((state) => {     //finnhub data stored in redux
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false' &&
            state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData = state?.showData?.dataSet?.[p.widgetKey]?.[p.config.targetSecurity]
            return (showData)
        }
    })

    const updateFilterMemo = useMemo(() => { //used inst useStartingFilters Hook.
        return {
            resolution: 'W',
            startDate: start,
            endDate: end,
            Description: 'Date numbers are millisecond offset from now. Used for Unix timestamp calculations.'
        }
    }, [start, end,])

    const focusSecurityList = useMemo(() => {
        return [p?.config?.targetSecurity]
    }, [p?.config?.targetSecurity])

    useDragCopy(ref, { chartData: chartData, options: options, })//useImperativeHandle. Saves state on drag. Dragging widget pops widget out of component array causing re-render as new component.
    useUpdateFocus(p.targetSecurity, p.updateWidgetConfig, p.widgetKey, isInitialMount, p.config) //sets security focus in config. Used for redux.visable data and widget excel templating.	
    useSearchMongoDb(p.currentDashBoard, p.finnHubQueue, p.config.targetSecurity, p.widgetKey, widgetCopy, dispatch, isInitialMount, p.dashboardID) //on change to target security retrieve fresh data from mongoDB
    useBuildVisableData(focusSecurityList, p.widgetKey, widgetCopy, dispatch, isInitialMount) //rebuild visable data on update to target security
    useStartingFilters(p.filters['startDate'], updateFilterMemo, p.widgetKey, p.dashBoardData, p.currentDashBoard, p.updateAppState, p.dispatch, p.apiKey, p.finnHubQueue, p.saveDashboard)

    interface ChartNode {
        x: Date,
        y: number[],
    }

    useEffect(() => {//CREATE CANDLE DATA
        if (rShowData !== undefined && Object.keys(rShowData).length > 0) {
            const data: any = rShowData //returned from finnHub API
            if (isCandleData(data)) {
                const nodeCount: number = data["c"].length;
                const chartData: Object[] = []
                for (let nodei = 0; nodei < nodeCount; nodei++) {
                    const yData: number[] = [
                        data["o"][nodei],
                        data["h"][nodei],
                        data["l"][nodei],
                        data["c"][nodei]
                    ]
                    const newNode: ChartNode = {
                        x: new Date(data["t"][nodei] * 1000),
                        y: yData, //open, high, low, close
                    };
                    chartData.push(newNode)
                    setChartData(chartData)
                }

                const options: Object = {
                    // width: 400,
                    height: 200,
                    theme: "light2", // "light1", "light2", "dark1", "dark2"
                    animationEnabled: true,
                    exportEnabled: true,
                    title: {
                        text: `Price Candles: ${p.config.targetSecurity}`,
                    },
                    axisX: {
                        valueFormatString: "YYYY-MM-DD",
                    },
                    axisY: {
                        prefix: "$",
                        title: "Price (in USD)",
                    },
                    data: [
                        {
                            type: "candlestick",
                            showInLegend: true,
                            name: p.config.targetSecurity,
                            yValueFormatString: "$###0.00",
                            xValueFormatString: "YYYY-MM-DD",
                            dataPoints: chartData,
                        },
                    ],
                };
                setOptions(options)
                // }
            } else { console.log("Failed candle data type guard:", data) }
        }
    }, [p.config.targetSecurity, rShowData, p.filters.endDate, p.filters.startDate, start, end])

    function editCandleListForm() {
        let securityList = (
            <WidgetRemoveSecurityTable
                trackedStocks={p.trackedStocks}
                widgetKey={p.widgetKey}
                exchangeList={p.exchangeList}
                dashBoardData={p.dashBoardData}
                currentDashboard={p.currentDashboard}
                updateAppState={p.updateAppState}
                apiKey={p.apiKey}
            />
        );
        return securityList;
    }

    function updateFilterResolution(e) {
        UpdateWidgetFilters(p.widgetKey, { [e.target.name]: e.target.value }, p.dashBoardData, p.currentDashBoard, p.updateAppState, dispatch, p.apiKey, p.finnHubQueue, p.saveDashboard)
    }

    function displayCandleGraph() {

        const resObj = {
            1: 'Daily',
            5: '5 Day',
            15: '15 Day',
            30: '30 Day',
            D: 'Daily',
            W: 'Weekly',
            M: 'Monthly',
        }

        const resText = resObj[p.filters.resolution]

        let symbolSelectorDropDown = (
            <>
                <div className="div-stack">
                    <WidgetFocus
                        widgetType={p.widgetType} updateWidgetConfig={p.updateWidgetConfig}
                        widgetKey={p.widgetKey}
                        trackedStocks={p.trackedStocks}
                        exchangeList={p.exchangeList}
                        config={p.config}
                    />
                </div>
                <div data-testid={`${resText} Price Candles: ${p.config.targetSecurity}`} className="graphDiv">
                    <CreateCandleStickChart candleData={options} />
                </div>
            </>
        );
        return symbolSelectorDropDown;
    }

    let resolutionList = ['1', '5', '15', '30', '60', "D", "W", "M"].map((el) => (
        <option key={el + "rsl"} value={el}>
            {el}
        </option>
    ));

    const helpText = <>
        Select data resulotion for candle chart. <br />
    </>

    return (
        <div data-testid='candleBody'>
            {p.showEditPane === 1 && (
                <>
                    <div className="searchPane">
                        {React.createElement(StockSearchPane, searchPaneProps(p))}
                        <div className="stockSearch">
                            {/* <form className="form-inline">
                                <label htmlFor="start">Start date:</label>
                                <input className="btn" id="start" type="date" name="startDate" onChange={updateStartDate} onBlur={updateFilterDate} value={start}></input>
                                <p>
                                    <label htmlFor="end">End date:</label>
                                    <input className="btn" id="end" type="date" name="endDate" onChange={updateEndDate} onBlur={updateFilterDate} value={end}></input>
                                </p>
                                <p> */}
                            <WidgetFilterDates
                                start={start}
                                end={end}
                                setStart={setStart}
                                setEnd={setEnd}
                                widgetKey={p.widgetKey}
                                widgetType={p.widgetType}
                                dashBoardData={p.dashBoardData}
                                currentDashBoard={p.currentDashBoard}
                                apiKey={p.apiKey}
                                finnHubQueue={p.finnHubQueue}
                                updateAppState={p.updateAppState}
                                saveDashboard={p.saveDashBoard}
                            />
                            <table>
                                <tbody>
                                    <tr>
                                        <td>
                                            <ToolTip textFragment={helpText} hintName='candeRes' />
                                        </td>
                                        <td style={{ color: 'white' }} className='rightTE'><label htmlFor="resBtn">Resolution:</label></td>
                                        <td>
                                            <select data-testid='candleResolutionSelect' id="resBtn" className="btn" name='resolution' value={p.filters.resolution} onChange={updateFilterResolution}>
                                                {resolutionList}
                                            </select>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            {/* </p>
                            </form> */}
                        </div>
                    </div>
                    <div>{Object.keys(p.trackedStocks).length > 0 ? editCandleListForm() : <></>}</div>
                </>
            )}
            {p.showEditPane === 0 && (
                Object.keys(p.trackedStocks).length > 0 ? displayCandleGraph() : <></>
            )}
        </div>
    );
}

export default forwardRef(PriceCandles)

export function candleWidgetProps(that, key = "Candles") {
    let propList = {
        apiKey: that.props.apiKey,
        defaultExchange: that.props.defaultExchange,
        exchangeList: that.props.exchangeList,
        filters: that.props.widgetList[key]["filters"],
        trackedStocks: that.props.widgetList[key]["trackedStocks"],
        updateWidgetConfig: that.props.updateWidgetConfig,
        widgetKey: key,
        targetSecurity: that.props.targetSecurity,
        dashBoardData: that.props.dashBoardData,
        currentDashBoard: that.props.currentDashBoard,
    };
    return propList;
}

export const candleWidgetFilters: object = {
    resolution: 'W',
    startDate: -31536000000,
    "endDate": 0,
    "Description": 'Date numbers are millisecond offset from now. Used for Unix timestamp calculations.'
}




