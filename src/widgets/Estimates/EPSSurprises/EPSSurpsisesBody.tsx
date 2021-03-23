import * as React from "react"
import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";
import ReactChart from "./reactChart";

import { useAppDispatch, useAppSelector } from '../../../hooks';
import { rBuildVisableData } from '../../../slices/sliceShowData'
import { tSearchMongoDB } from '../../../thunks/thunkSearchMongoDB'

import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";

const useDispatch = useAppDispatch
const useSelector = useAppSelector

interface FinnHubAPIData { //rename
    actual: number,
    estimate: number,
    period: string, //YYYY-MM-DD
    symbol: string,
}

interface FinnHubAPIDataArray {
    [index: number]: FinnHubAPIData
}

interface dataListObject {
    x: Date,
    y: string
}

function isFinnHubData(arg: any): arg is FinnHubAPIDataArray { //typeguard
    console.log('!arg', arg)
    if (arg !== undefined && Object.keys(arg).length > 0 && arg[0].actual) {
        // console.log("returning true", arg)
        return true
    } else {
        // console.log("returning false", arg)
        return false
    }
}
//RENAME FUNCTION
function EstimatesEPSSurprises(p: { [key: string]: any }, ref: any) {

    const startingstockData = () => {
        if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
            return (p.widgetCopy.stockData)
        } else { return ([]) }
    }

    const startingTargetStock = () => { //REMOVE IF TARGET STOCK NOT NEEDED.
        if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
            return (p.widgetCopy.targetStock)
        } else { return ('') }
    }

    const [stockData, setStockData] = useState(startingstockData());
    const [targetStock, setTargetStock] = useState(startingTargetStock());
    const [chartOptions, setChartOptions] = useState({})
    const isInitialMount = useRef(true); //update to false after first render.
    const dispatch = useDispatch(); //allows widget to run redux actions.

    const rShowData = useSelector((state) => { //REDUX Data associated with this widget.
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false' &&
            state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData: object = state.showData.dataSet[p.widgetKey][targetStock]
            return (showData)
        }
    })

    useImperativeHandle(ref, () => (
        //used to copy widgets when being dragged. example: if widget body renders time series data into chart, copy chart data.
        //add additional slices of state to list if they help reduce re-render time.
        {
            state: {
                stockData: stockData,
                targetStock: targetStock,
                chartOptions: chartOptions,
            },
        }
    ))

    useEffect(() => {
        //On mount, use widget copy, else build visable data.
        //On update, if change in target stock, rebuild visable data.
        if (isInitialMount.current && p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
            isInitialMount.current = false;
        } else {
            if (isInitialMount.current === true) { isInitialMount.current = false }
            const payload: object = {
                key: p.widgetKey,
                securityList: [[`${targetStock}`]]
            }
            dispatch(rBuildVisableData(payload))
        }
    }, [targetStock, p.widgetKey, p.widgetCopy, dispatch])

    // useEffect((filters: filters = p.filters, update: Function = p.updateWidgetFilters, key: number = p.widgetKey) => {
    //     //DELETE IF NO FILTERS
    //     //Setup filters if not yet done.
    //     //example update commented out below. 
    //     if (filters['startDate'] === undefined) {
    //         // const startDateOffset = -604800 * 1000 * 52 * 20 //20 year backward. Limited to 1 year on free version.
    //         // const endDateOffset = 0 //today.
    //         // update(key, 'startDate', startDateOffset)
    //         // update(key, 'endDate', endDateOffset)
    //         // update(key, 'Description', 'Date numbers are millisecond offset from now. Used for Unix timestamp calculations.')

    //     }
    // }, [p.filters, p.updateWidgetFilters, p.widgetKey])

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
        }
    }, [rShowData])

    useEffect(() => {
        console.log('stock data updated, created chart objects.')
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
        console.log("new chart data", chartData)

        const options = {
            width: 400,
            height: 200,
            theme: "light2",
            animationEnabled: true,
            exportEnabled: true,
            title: {
                text: `${targetStock}: EPS Surprises'`
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

    }, [stockData, targetStock])

    // function updateFilter(e) {
    //     if (isNaN(new Date(e.target.value).getTime()) === false) {
    //         const now = Date.now()
    //         const target = new Date(e.target.value).getTime();
    //         const offset = target - now
    //         const name = e.target.name;
    //         p.updateWidgetFilters(p.widgetKey, name, offset)
    //     }
    // }

    function changeStockSelection(e) { //DELETE IF no target stock
        const target = e.target.value;
        const key = `${p.widgetKey}-${target}`
        setTargetStock(target)
        dispatch(tSearchMongoDB([key]))
    }

    function renderSearchPane() {
        //add search pane rendering logic here. Additional filters need to be added below.
        const stockList = Object.keys(p.trackedStocks);
        const stockListRows = stockList.map((el) =>
            <tr key={el + "container"}>
                <td key={el + "name"}>{p.trackedStocks[el].dStock(p.exchangeList)}</td>

                <td key={el + "buttonC"}>
                    <button
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
                <div className="div-inline">
                    {"  Selection:  "}
                    <select className="btn" value={targetStock} onChange={changeStockSelection}>
                        {newSymbolList}
                    </select>
                </div>
                <div className="graphDiv">
                    <ReactChart chartOptions={chartOptions} />
                </div>
            </>
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
//RENAME
export default forwardRef(EstimatesEPSSurprises)
//RENAME
export function EPSSurprisesProps(that, key = "newWidgetNameProps") {
    let propList = {
        apiKey: that.props.apiKey,
        defaultExchange: that.props.defaultExchange,
        exchangeList: that.props.exchangeList,
        filters: that.props.widgetList[key]["filters"],
        showPane: that.showPane,
        trackedStocks: that.props.widgetList[key]["trackedStocks"],
        throttle: that.props.throttle,
        updateDefaultExchange: that.props.updateDefaultExchange,
        updateWidgetFilters: that.props.updateWidgetFilters,
        updateGlobalStockList: that.props.updateGlobalStockList,
        updateWidgetStockList: that.props.updateWidgetStockList,
        widgetKey: key,
    };
    return propList;
}

//rename
// export const priceSplitsFilters: object = { //IF widget uses filters remember to define default filters here and add to topNavReg as 5th paramater.
//     // startDate: -604800 * 1000 * 52 * 20, //20 years
//     // endDate: 0,
//     //... additional filters...
//     // "Description": 'Date numbers are millisecond offset from now. Used for Unix timestamp calculations.'
// }

