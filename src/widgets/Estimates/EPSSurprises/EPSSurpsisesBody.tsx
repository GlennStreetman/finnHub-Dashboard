import * as React from "react"
import { useState, useEffect, forwardRef, useRef, useMemo } from "react";
import ReactChart from "./reactChart";

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

function EstimatesEPSSurprises(p: { [key: string]: any }, ref: any) {

    const isInitialMount = useRef(true); //update to false after first render.

    const startingWidgetCoptyRef = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy !== undefined && p.widgetCopy.widgetID !== null) {
                return p.widgetCopy.widgetID
            } else { return -1 }
        }
    }

    const [chartOptions, setChartOptions] = useState({})
    const [widgetCopy] = useState(startingWidgetCoptyRef())
    const dispatch = useDispatch(); //allows widget to run redux actions.

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
    useUpdateFocus(p.targetSecurity, p.updateWidgetConfig, p.widgetKey, p.config.targetSecurity) //sets security focus in config. Used for redux.visable data and widget excel templating.
    useSearchMongoDb(p.currentDashBoard, p.finnHubQueue, p.config.targetSecurity, p.widgetKey, widgetCopy, dispatch, isInitialMount) //on change to target security retrieve fresh data from mongoDB
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
                updateWidgetStockList={p.updateWidgetStockList}
                exchangeList={p.exchangeList}
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
                        updateWidgetConfig={p.updateWidgetConfig}
                        widgetKey={p.widgetKey}
                        trackedStocks={p.trackedStocks}
                        exchangeList={p.exchangeList}
                        config={p.config}
                    />
                </div>
                <div className="graphDiv" data-testid={`EPSChart`}>
                    <ReactChart chartOptions={chartOptions} />
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
