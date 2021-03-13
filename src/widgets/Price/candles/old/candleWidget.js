import React , {useState, useEffect, useImperativeHandle, forwardRef} from "react";
import { useSelector, useDispatch } from 'react-redux';
import { rBuildVisableData } from '../../../../slices/sliceShowData.js'
import { tSearchMongoDB } from '../../../../thunks/thunkSearchMongoDB.js'
import StockSearchPane, {searchPaneProps} from "../../../../components/stockSearchPaneFunc.js";
import CreateCandleStickChart from "../createCandleStickChart.js";

function PriceCandles(p, ref) {
    
    const [candleSelection, setCandleSelection] = useState('');
    const [chartData, setChartData] = useState([])
    const [options, setOptions] = useState({})
    const [selectResolution, setSelectResolution] = useState([1, 5, 15, 30, 60, "D", "W", "M"])
    
    const dispatch = useDispatch()

    const rCandleData = useSelector((state) => { 
        // console.log("CandleState", state, p.widgetType, p.widgetKey)
        if (state.dataModel !== undefined && state.dataModel.created === true && state.showData.dataSet[p.widgetKey] !== undefined) {
            const CandleData = state.showData.dataSet[p.widgetKey][candleSelection]
            // console.log('CandleData', CandleData)
            return (CandleData)
        }
    })

    useImperativeHandle(ref, () => (
        //used to copy widgets when being dragged.
        {
            state: {
                candleSelection: candleSelection,
                chartData: chartData,
                options: options,
                selectResolution: selectResolution,
            },
        }
    ))

    useEffect(()=>{ //USE WIDGET COPY
        //on mount, use widget copy if available, or run setup.
        if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
            console.log('use widget copy candles')
            setCandleSelection(p.widgetCopy.candleSelection)
            setChartData(p.widgetCopy.chartData)
            setOptions(p.widgetCopy.options)
            setSelectResolution(p.widgetCopy.selectResolution)
        } else {
            if (p.filters['startDate'] === undefined) {
                console.log("Setting up candles")
                const startDateSetBack = 31536000*1000 //1 week
                const endDateSetBack = 0
                p.updateWidgetFilters(p.widgetKey, 'startDate', startDateSetBack)
                p.updateWidgetFilters(p.widgetKey, 'endDate', endDateSetBack)
                p.updateWidgetFilters(p.widgetKey, 'Description', 'Date numbers are millisecond offset from now. Used for Unix timestamp calculations.')
                p.updateWidgetFilters(p.widgetKey, 'resolution', 'W')
            } 
    }}, [])

    useEffect(()=>{ //SET DEFAULT STOCK
        //if stock not selected default to first stock.
        if (p.trackedStocks.sKeys().length > 0 && candleSelection === '') {
            const setDefault = p.trackedStocks[p.trackedStocks.sKeys()[0]].key
            setCandleSelection(setDefault)
        }
    }, [p.trackedStocks, candleSelection])

    useEffect(()=> { //CREATE CANDLE DATA
        if (rCandleData !== undefined && Object.keys(rCandleData).length > 0){
            const data = rCandleData
                const nodeCount = data["c"].length;
                const chartData = []
                for (let nodei = 0; nodei < nodeCount; nodei++) {
                    let newNode = {
                    x: new Date(data["t"][nodei] * 1000),
                    y: [data["o"][nodei], data["h"][nodei], data["l"][nodei], data["c"][nodei]], //open, high, low, close
                    };
                    chartData.push(newNode)
                    setChartData(chartData)
                }
            //SET CHART OPTIONS
            const now = Date.now()
            const startUnixOffset = p.filters.startDate !== undefined ? p.filters.startDate : 604800*1000
            const startUnix = now - startUnixOffset
            const endUnixOffset = p.filters.startDate !== undefined ? p.filters.endDate : 0
            const endUnix = now - endUnixOffset
            const startDate = new Date(startUnix).toISOString().slice(0, 10);
            const endDate = new Date(endUnix).toISOString().slice(0, 10);
            
            const options = {
            width: 400,
            height: 200,
            theme: "light2", // "light1", "light2", "dark1", "dark2"
            animationEnabled: true,
            exportEnabled: true,
            title: {
                text: candleSelection + ": " + startDate + " - " + endDate,
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
                name: candleSelection,
                yValueFormatString: "$###0.00",
                xValueFormatString: "YYYY-MM-DD",
                dataPoints: chartData,
                },
            ],
            };
            console.log("setting candle options")
            setOptions(options)
            // }
        }
    }, [candleSelection, p.showEditPane, rCandleData, p.filters.endDate, p.filters.startDate])

    useEffect(()=>{
        //on change in candle selection set visable to empty object.
        const payload = {
            key: p.widgetKey,
            securityList: [[`${candleSelection}`]]
        }
        dispatch(rBuildVisableData(payload))

    }, [candleSelection, p.widgetKey, dispatch])

    function updateWidgetList(stock) {
        if (stock.indexOf(":") > 0) {
            const stockSymbole = stock.slice(0, stock.indexOf(":"));
            p.updateWidgetStockList(p.widgetKey, stockSymbole);
        } else {
            p.updateWidgetStockList(p.widgetKey, stock);
        }
    }

    function updateFilter(e) {
    // const target = e.target;
    // const name = target.name;
    if (isNaN(new Date(e.target.value).getTime()) === false){
        const now = Date.now()
        const target = new Date(e.target.value).getTime();
        const offset = now - target
        const name = e.target.name;
        p.updateWidgetFilters(p.widgetKey, name, offset);
    };
    }

    function changeStockSelection(e) {
        const target = e.target.value;
        const key = `${p.widgetKey}-${target}`
        setCandleSelection(target)
        dispatch(tSearchMongoDB([key]))
    }

    function editCandleListForm() {
        let candleList = p.trackedStocks.sKeys();
        let candleSelectionRow = candleList.map((el) =>
        p.showEditPane === 1 ? (
            <tr key={el + "container"}>
            <td key={el + "name"}>{p.trackedStocks[el].dStock(p.exchangeList)}</td>
            <td key={el + "buttonC"}>
                <button
                key={el + "button"}
                onClick={() => {
                    updateWidgetList(el);
                }}
                >
                <i className="fa fa-times" aria-hidden="true" key={el + "icon"}></i>
                </button>
            </td>
            </tr>
        ) : (
            <tr key={el + "pass"}></tr>
        )
        );
        let stockCandleTable = (
        <table>
            <tbody>{candleSelectionRow}</tbody>
        </table>
        );
        return stockCandleTable;
    }

    function displayCandleGraph() {
        let newSymbolList = p.trackedStocks.sKeys().map((el) => (
        <option key={el + "ddl"} value={el}>
            {p.trackedStocks[el].dStock(p.exchangeList)}
        </option>
        ));

        let symbolSelectorDropDown = (
        <>
            <div className="div-inline">
            {"  Selection:  "}
            <select className="btn" value={candleSelection} onChange={changeStockSelection}>
                {newSymbolList}
            </select>
            </div>
            <div className="graphDiv">
            <CreateCandleStickChart candleData={options} />
            </div>
        </>
        );
        return symbolSelectorDropDown;
    }

    let resolutionList = selectResolution.map((el) => (
        <option key={el + "rsl"} value={el}>
            {el}
        </option>
    ));

    const now = Date.now()
    const startUnixOffset = p.filters.startDate !== undefined ? p.filters.startDate : 604800*1000
    const startUnix = now - startUnixOffset
    const endUnixOffset = p.filters.startDate !== undefined ? p.filters.endDate : 0
    const endUnix = now - endUnixOffset
    const startDate = new Date(startUnix).toISOString().slice(0, 10);
    const endDate = new Date(endUnix).toISOString().slice(0, 10);

    return (
        <>
            {p.showEditPane === 1 && (
            <>
                <div className="searchPane">
                {React.createElement(StockSearchPane, searchPaneProps(p))}
                <div className="stockSearch">
                    <form className="form-inline">
                    <label htmlFor="start">Start date:</label>
                    <input className="btn" id="start" type="date" name="startDate" onChange={updateFilter} value={startDate}></input>
                    <label htmlFor="end">End date:</label>
                    <input className="btn" id="end" type="date" name="endDate" onChange={updateFilter} value={endDate}></input>
                    <label htmlFor="resBtn">Resolution:</label>
                    <select id="resBtn" className="btn" name='resolution' value={p.filters.resolution} onChange={updateFilter}>
                        {resolutionList}
                    </select>
                    </form>
                </div>
                </div>
                <div>{Object.keys(p.trackedStocks).length > 0 ? editCandleListForm() : <></>}</div>
            </>
            )}
            {p.showEditPane === 0 && (
            Object.keys(p.trackedStocks).length > 0 ? displayCandleGraph() : <></>
            )}
        </>
    );
}

export default forwardRef(PriceCandles)

export function candleWidgetProps(that, key = "Candles") {
    let propList = {
        apiKey: that.props.apiKey,
        filters: that.props.widgetList[key]["filters"],
        showPane: that.showPane,
        trackedStocks: that.props.widgetList[key]["trackedStocks"],
        updateGlobalStockList: that.props.updateGlobalStockList,
        updateWidgetFilters: that.props.updateWidgetFilters,
        updateWidgetStockList: that.props.updateWidgetStockList,
        widgetKey: key,
        throttle: that.props.throttle,
        exchangeList: that.props.exchangeList,
        defaultExchange: that.props.defaultExchange,
        updateDefaultExchange: that.props.updateDefaultExchange,
    };
    return propList;
}



