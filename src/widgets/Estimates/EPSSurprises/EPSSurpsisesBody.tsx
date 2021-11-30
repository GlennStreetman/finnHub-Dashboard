import * as React from "react"
import { useState, useEffect, forwardRef, useRef, useMemo } from "react";
import ReactChart from "./reactChart";

import { widget } from 'src/App'
import { finnHubQueue } from "src/appFunctions/appImport/throttleQueueAPI";

//redux
import { createSelector } from 'reselect'
import { storeState } from './../../../store'
import { useAppDispatch, useAppSelector } from '../../../hooks';

//hooks
import { useDragCopy } from '../../widgetHooks/useDragCopy'
import { useSearchMongoDb } from '../../widgetHooks/useSearchMongoDB'
import { useBuildVisableData } from '../../widgetHooks/useBuildVisableData'
import { useUpdateFocus } from './../../widgetHooks/useUpdateFocus'

//widget components
import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";
import WidgetFocus from '../../../components/widgetFocus'
import WidgetRemoveSecurityTable from '../../../components/widgetRemoveSecurityTable'

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

interface widgetProps {
    config: any,
    enableDrag: boolean,
    filters: any,
    finnHubQueue: finnHubQueue,
    pagination: number,
    showEditPane: number,
    trackedStocks: any,
    widgetCopy: widget,
    widgetKey: string | number,
    widgetType: string,
}

function EstimatesEPSSurprises(p: widgetProps, ref: any) {

    const dispatch = useDispatch(); //allows widget to run redux actions.

    const isInitialMount = useRef(true); //update to false after first render.

    const startingWidgetCoptyRef = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy !== undefined && typeof p.widgetCopy.widgetID === 'number') {
                return p.widgetCopy.widgetID
            } else { return 0 }
        } else { return 0 }
    }

    const [chartOptions, setChartOptions] = useState({})
    const [widgetCopy] = useState(startingWidgetCoptyRef())
    const apiKey = useSelector((state) => { return state.apiKey })
    const currentDashboard = useSelector((state) => { return state.currentDashboard })
    const dashboardData = useSelector((state) => { return state.dashboardData })
    const targetSecurity = useSelector((state) => { return state.targetSecurity })
    const exchangeList = useSelector((state) => { return state.exchangeList.exchangeList })
    const dashboardID = dashboardData?.[currentDashboard]?.['id'] ? dashboardData[currentDashboard]['id'] : -1

    const showDataSelector = createSelector(
        (state: storeState) => state.showData.dataSet[p.widgetKey][p.config.targetSecurity],
        returnValue => returnValue
    )

    const rShowData = useSelector((state) => { //REDUX Data associated with this widget.
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false' &&
            state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData: object = showDataSelector(state)
            return (showData)
        }
    })

    const focusSecurityList = useMemo(() => { //remove if all securities should stay in focus.
        return [p?.config?.targetSecurity]
    }, [p?.config?.targetSecurity])

    useDragCopy(ref, { chartOptions: chartOptions, }) //useImperativeHandle. Saves state on drag. Dragging widget pops widget out of component array causing re-render as new component.
    useUpdateFocus(targetSecurity, p.widgetKey, p.config, dashboardData, currentDashboard, p.enableDrag, dispatch) //sets security focus in config. Used for redux.visable data and widget excel templating.
    useSearchMongoDb(currentDashboard, p.finnHubQueue, p.config.targetSecurity, p.widgetKey, widgetCopy, dispatch, isInitialMount, dashboardID) //on change to target security retrieve fresh data from mongoDB
    useBuildVisableData(focusSecurityList, p.widgetKey, widgetCopy, dispatch, isInitialMount) //rebuild visable data on update to target security

    useEffect(() => { //create data chart
        const actualList: dataListObject[] = []
        const estimateList: dataListObject[] = []

        for (const i in rShowData) {
            actualList.push({ 'x': new Date(rShowData[i]['period']), 'y': rShowData[i]['actual'] })
            estimateList.push({ 'x': new Date(rShowData[i]['period']), 'y': rShowData[i]['estimate'] })
        }

        const chartData = {
            actual: actualList,
            estimate: estimateList,
        }

        const options = {
            width: 400,
            height: 200,
            theme: "light2",
            animationEnabled: true,
            exportEnabled: true,
            title: {
                text: `${p.config.targetSecurity}: EPS Surprises`
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

    }, [rShowData, p.config.targetSecurity])

    function renderSearchPane() {
        let stockTable = (
            <WidgetRemoveSecurityTable
                trackedStocks={p.trackedStocks}
                widgetKey={p.widgetKey}
                exchangeList={exchangeList}
                dashBoardData={dashboardData}
                currentDashboard={currentDashboard}
                apiKey={apiKey}
            />
        );
        return stockTable
    }

    function renderStockData() {

        let chartBody = (
            <>
                <div data-testid="SelectionLabel" className="div-stack" >
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
                <div className="graphDiv" data-testid={`EPSChart`}>
                    <ReactChart chartOptions={chartOptions} testid={`chart-${p.widgetType}`} />
                </div>
            </>
        );
        return chartBody;
    }
    return (
        <div data-testid="EPSSurprisesBody">
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
        // apiKey: that.props.apiKey,
        // defaultExchange: that.props.defaultExchange,
        // exchangeList: that.props.exchangeList,
        // filters: that.props.widgetList[key]["filters"],
        // trackedStocks: that.props.widgetList[key]["trackedStocks"],
        // widgetKey: key,
        // targetSecurity: that.props.targetSecurity,
        // dashBoardData: that.props.dashBoardData,
        // currentDashBoard: that.props.currentDashBoard,
    };
    return propList;
}
