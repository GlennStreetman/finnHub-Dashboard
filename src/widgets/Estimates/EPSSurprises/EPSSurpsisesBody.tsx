import * as React from "react"
import { useState, useEffect, forwardRef, useRef, useMemo } from "react";
import ReactChart from "./reactChart";

import { createSelector } from 'reselect'
import { storeState } from './../../../store'

import { useAppDispatch, useAppSelector } from '../../../hooks';
import { tSearchMongoDB } from '../../../thunks/thunkSearchMongoDB'

import { useDragCopy } from '../../widgetHooks/useDragCopy'
import { useSearchMongoDb } from '../../widgetHooks/useSearchMongoDB'
import { useBuildVisableData } from '../../widgetHooks/useBuildVisableData'
import { useUpdateFocus } from './../../widgetHooks/useUpdateFocus'


import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";
import { dStock } from './../../../appFunctions/formatStockSymbols'

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
    useSearchMongoDb(p.config.targetSecurity, p.widgetKey, widgetCopy, dispatch, isInitialMount) //on change to target security retrieve fresh data from mongoDB
    useBuildVisableData(focusSecurityList, p.widgetKey, widgetCopy, dispatch, isInitialMount) //rebuild visable data on update to target security

    useEffect(() => { //create data chart
        const actualList: dataListObject[] = []
        const estimateList: dataListObject[] = []

        for (const i in rShowData) {
            // const n = stockData
            actualList.push({ 'x': new Date(rShowData[i]['period']), 'y': rShowData[i]['actual'] })
            estimateList.push({ 'x': new Date(rShowData[i]['period']), 'y': rShowData[i]['estimate'] })
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

    }, [rShowData, p.config.targetSecurity])

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
                <td className="centerTE" key={el + "buttonC"}>
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

    function renderStockData() {
        let newSymbolList = Object.keys(p.trackedStocks).map((el) => (
            <option key={el + "ddl"} value={el}>
                {dStock(p.trackedStocks[el], p.exchangeList)}
            </option>
        ));

        let chartBody = (
            <>
                <div data-testid="SelectionLabel" className="div-stack" >
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
        trackedStocks: that.props.widgetList[key]["trackedStocks"],
        updateWidgetStockList: that.props.updateWidgetStockList,
        updateWidgetConfig: that.props.updateWidgetConfig,
        widgetKey: key,
        targetSecurity: that.props.targetSecurity,
    };
    return propList;
}
