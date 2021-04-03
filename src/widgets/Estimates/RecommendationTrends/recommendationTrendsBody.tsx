import * as React from "react"
import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";
import RecTrendChart from "./recTrendChart";

import { useAppDispatch, useAppSelector } from '../../../hooks';
import { rBuildVisableData } from '../../../slices/sliceShowData'
import { tSearchMongoDB } from '../../../thunks/thunkSearchMongoDB'

import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";

const useDispatch = useAppDispatch
const useSelector = useAppSelector

interface FinnHubAPIData { //rename
    symbol: string,
    buy: number,
    hold: number,
    period: string,
    sell: number,
    strongBuy: number,
    strongSell: number,
}

interface FinnHubAPIDataArray {
    [index: number]: FinnHubAPIData
}

interface DataChartObject {
    strongSell: object,
    sell: object,
    hold: object,
    buy: object,
    strongBuy: object,
}

//add any additional type guard functions here used for live code.
function isFinnHubData(arg: any): arg is FinnHubAPIDataArray { //typeguard
    if (arg !== undefined && Object.keys(arg).length > 0 && arg[0].symbol) {
        // console.log("returning true", arg)
        return true
    } else {
        // console.log("returning false", arg)
        return false
    }
}

function EstimatesRecommendationTrends(p: { [key: string]: any }, ref: any) {
    const isInitialMount = useRef(true); //update to false after first render.

    const startingstockData = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
                // console.log('returning draftCopy')
                const stockData = JSON.parse(JSON.stringify(p.widgetCopy.stockData))
                return (stockData)
            } else {
                // console.log('returning empty copy')
                return ([])
            }
        }
    }

    const startingTargetStock = () => { //REMOVE IF TARGET STOCK NOT NEEDED.
        if (isInitialMount.current === true) {
            if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
                const targetStock = p.widgetCopy.targetStock
                return (targetStock)
            } else { return ('') }
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
    const [targetStock, setTargetStock] = useState(startingTargetStock());
    const [widgetCopy] = useState(startingWidgetCoptyRef())
    const [chartOptions, setchartOptions] = useState({})
    const dispatch = useDispatch(); //allows widget to run redux actions.

    const rShowData = useSelector((state) => { //REDUX Data associated with this widget.
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false' &&
            state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData: object = state.showData.dataSet[p.widgetKey][targetStock]
            // console.log("11!!", p.widgetKey, targetStock)
            return (showData)
        } else { console.log("-----------------broken selector----------------", p.widgetKey, targetStock) }
    })

    useImperativeHandle(ref, () => (
        //used to copy widgets when being dragged. example: if widget body renders time series data into chart, copy chart data.
        //add additional slices of state to list if they help reduce re-render time.
        {
            state: {
                stockData: JSON.parse(JSON.stringify(stockData)),
                targetStock: targetStock, //REMOVE IF NO TARGET STOCK
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
                securityList: [[`${targetStock}`]]
            }
            console.log(payload)
            dispatch(rBuildVisableData(payload))
        }
    }, [targetStock, p.widgetKey, widgetCopy, dispatch])

    useEffect(() => {
        //DELETE IF NO TARGET STOCK
        //if stock not selected default to first stock.
        if (Object.keys(p.trackedStocks).length > 0 && targetStock === '') {
            const setDefault = p.trackedStocks[Object.keys(p.trackedStocks)[0]].key
            setTargetStock(setDefault)
        }
    }, [p.trackedStocks, targetStock])

    useEffect(() => { //on update to redux data, update widget stock data, as long as data passes typeguard.
        if (isFinnHubData(rShowData) === true) { setStockData(rShowData) } else {
            console.log("broken connection")
            setStockData([])
        }
    }, [rShowData])

    useEffect(() => {
        // console.log('CALC TREND', stockData, targetStock)
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
        const listSixData = stockData.slice(0, 12)
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
                text: targetStock,
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

    }, [stockData, targetStock])

    useEffect(() => { //on change to targetSecurity update widget focus
        if (p.targetSecurity !== '') {
            const target = `${p.widgetKey}-${p.targetSecurity}`
            setTargetStock(p.targetSecurity)
            dispatch(tSearchMongoDB([target]))
        }
    }, [p.targetSecurity, p.widgetKey, dispatch])


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

    function changeStockSelection(e) { //DELETE IF no target stock
        const target = e.target.value;
        const key = `${p.widgetKey}-${target}`
        setTargetStock(target)
        dispatch(tSearchMongoDB([key]))
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
                    <RecTrendChart chartOptions={chartOptions} />
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
export default forwardRef(EstimatesRecommendationTrends)
//RENAME
export function recommendationTrendsProps(that, key = "newWidgetNameProps") {
    let propList = {
        apiKey: that.props.apiKey,
        defaultExchange: that.props.defaultExchange,
        exchangeList: that.props.exchangeList,
        filters: that.props.widgetList[key]["filters"],
        showPane: that.showPane,
        trackedStocks: that.props.widgetList[key]["trackedStocks"],
        updateDefaultExchange: that.props.updateDefaultExchange,
        updateWidgetFilters: that.props.updateWidgetFilters,
        updateGlobalStockList: that.props.updateGlobalStockList,
        updateWidgetStockList: that.props.updateWidgetStockList,
        widgetKey: key,
        targetSecurity: that.props.targetSecurity,
    };
    return propList;
}


