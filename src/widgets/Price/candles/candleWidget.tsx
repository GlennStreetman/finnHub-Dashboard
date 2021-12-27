import * as React from "react"
import { useState, useEffect, useMemo, forwardRef, useRef } from "react";
import { widget } from 'src/App'
import { finnHubQueue } from "src/appFunctions/appImport/throttleQueueAPI";



import { useAppDispatch, useAppSelector } from '../../../hooks';

import CreateCandleStickChart from "./createCandleStickChart";
import WidgetFilterDates from '../../../components/widgetFilterDates'
import ToolTip from '../../../components/toolTip'

import { useDragCopy } from './../../widgetHooks/useDragCopy'

import { useSearchMongoDb } from './../../widgetHooks/useSearchMongoDB'
import { useBuildVisableData } from './../../widgetHooks/useBuildVisableData'
import { useStartingFilters } from './../../widgetHooks/useStartingFilters'
import { useUpdateFocus } from './../../widgetHooks/useUpdateFocus'

import WidgetFocus from '../../../components/widgetFocus'
import WidgetRemoveSecurityTable from '../../../components/widgetRemoveSecurityTable'
import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPane";

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

interface widgetProps {
    config: any,
    enableDrag: boolean,
    filters: any,
    finnHubQueue: finnHubQueue,
    pagination: number,
    showEditPane: number,
    trackedStocks: any,
    widgetCopy: any,
    widgetKey: string | number,
    widgetType: string,
}

function isCandleData(arg: any): arg is FinnHubCandleData { //defined shape of candle data. CHeck used before rendering.
    return arg.c !== undefined
}

function PriceCandles(p: widgetProps, ref: any) {
    const isInitialMount = useRef(true); //update to false after first render.

    const startingWidgetCoptyRef = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy !== undefined && typeof p.widgetCopy.widgetID === 'number') {
                return p.widgetCopy.widgetID
            } else { return 0 }
        } else { return 0 }
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
    const [chartData, setChartData] = useState<false | object>(false)
    // const [options, setOptions] = useState(startingOptions())
    const [start, setStart] = useState(startingStartDate())
    const [end, setEnd] = useState(startingEndDate())
    const dispatch = useDispatch()
    const apiKey = useSelector((state) => { return state.apiKey })
    const currentDashboard = useSelector((state) => { return state.currentDashboard })
    const dashboardData = useSelector((state) => { return state.dashboardData })
    const targetSecurity = useSelector((state) => { return state.targetSecurity })
    const exchangeList = useSelector((state) => { return state.exchangeList.exchangeList })
    const dashboardID = dashboardData?.[currentDashboard]?.['id'] ? dashboardData[currentDashboard]['id'] : -1


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

    useDragCopy(ref, { chartData: chartData })//useImperativeHandle. Saves state on drag. Dragging widget pops widget out of component array causing re-render as new component.
    useUpdateFocus(targetSecurity, p.widgetKey, p.config, dashboardData, currentDashboard, p.enableDrag, dispatch) //sets security focus in config. Used for redux.visable data and widget excel templating.	
    useSearchMongoDb(currentDashboard, p.finnHubQueue, p.config.targetSecurity, p.widgetKey, widgetCopy, dispatch, isInitialMount, dashboardID) //on change to target security retrieve fresh data from mongoDB
    useBuildVisableData(focusSecurityList, p.widgetKey, widgetCopy, dispatch, isInitialMount) //rebuild visable data on update to target security
    useStartingFilters(p.filters['startDate'], updateFilterMemo, p.widgetKey, dashboardData, currentDashboard, dispatch, apiKey, p.finnHubQueue)

    interface ChartNode {
        x: Date,
        y: number[],
    }

    useEffect(() => {//CREATE CANDLE DATA
        if (rShowData !== undefined && Object.keys(rShowData).length > 0) {

            const high = {
                type: 'scatter' as const,
                label: 'High',
                data: rShowData.h.map((el) => {
                    return ({ x: el, y: el })
                }),
                backgroundColor: 'rgba(255, 99, 132, 1)',
            }
            const low = {
                type: 'scatter' as const,
                label: 'Low',
                data: rShowData.l.map((el) => {
                    return ({ x: el, y: el })
                }),
                backgroundColor: 'rgba(155, 59, 102, 1)',
            }
            const OC = { //open/close bar data
                type: 'bar' as const,
                label: 'Open/Close',
                backgroundColor: 'rgb(75, 192, 192)',
                data: rShowData.o.map((el, i) => {
                    return ([el, rShowData.c[i]])
                }),
                borderColor: 'white',
                borderWidth: 2,
            }

            const newChartData = {
                labels: rShowData.t.map(el => new Date(el * 1000).toISOString().split('T')[0]), // new Date(el).toISOString().split('T')[0])
                datasets: [
                    OC,
                    high,
                    low,
                ]
            }

            console.log('newChartData', newChartData)

            setChartData(newChartData)

        } else { console.log("Failed candle data type guard:", rShowData) }

    }, [p.config.targetSecurity, rShowData, p.filters.endDate, p.filters.startDate, start, end])

    function editCandleListForm() {
        let securityList = (
            <WidgetRemoveSecurityTable
                trackedStocks={p.trackedStocks}
                widgetKey={p.widgetKey}
                exchangeList={exchangeList}
                dashBoardData={dashboardData}
                currentDashboard={currentDashboard}
                apiKey={apiKey}
            />
        );
        return securityList;
    }

    function updateFilterResolution(e) {
        UpdateWidgetFilters(p.widgetKey, { [e.target.name]: e.target.value }, dashboardData, currentDashboard, dispatch, apiKey, p.finnHubQueue)
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
                        widgetType={p.widgetType}
                        widgetKey={p.widgetKey}
                        trackedStocks={p.trackedStocks}
                        exchangeList={exchangeList}
                        config={p.config}
                        dashBoardData={dashboardData}
                        currentDashboard={currentDashboard}
                        enableDrag={p.enableDrag}
                    />
                </div>
                {/* <div data-testid={`${resText} Price Candles: ${p.config.targetSecurity}`} className="graphDiv"> */}
                <CreateCandleStickChart chartData={chartData} />
                {/* </div> */}
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
                            <WidgetFilterDates
                                start={start}
                                end={end}
                                setStart={setStart}
                                setEnd={setEnd}
                                widgetKey={p.widgetKey}
                                widgetType={p.widgetType}
                                dashboardData={dashboardData}
                                currentDashboard={currentDashboard}
                                apiKey={apiKey}
                                finnHubQueue={p.finnHubQueue}
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
    };
    return propList;
}

export const candleWidgetFilters: object = {
    resolution: 'W',
    startDate: -31536000000,
    "endDate": 0,
    "Description": 'Date numbers are millisecond offset from now. Used for Unix timestamp calculations.'
}




