import * as React from "react";
import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { rBuildVisableData } from '../../../slices/sliceShowData';
import { tSearchMongoDB } from '../../../thunks/thunkSearchMongoDB';
import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";
import CreateCandleStickChart from "./createCandleStickChart";
const useDispatch = useAppDispatch;
const useSelector = useAppSelector;
function isCandleData(arg) {
    return arg.c !== undefined;
}
function PriceCandles(p, ref) {
    const startingCandleSelection = () => {
        if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
            return (p.widgetCopy.candleSelection);
        }
        else {
            return ('');
        }
    };
    const startingCandleData = () => {
        if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
            return (p.widgetCopy.chartData);
        }
        else {
            return ([]);
        }
    };
    const startingOptions = () => {
        if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
            return (p.widgetCopy.options);
        }
        else {
            return ({});
        }
    };
    const [candleSelection, setCandleSelection] = useState(startingCandleSelection());
    const [chartData, setChartData] = useState(startingCandleData());
    const [options, setOptions] = useState(startingOptions());
    const isInitialMount = useRef(true);
    const dispatch = useDispatch();
    //finnhub data stored in redux
    const rShowData = useSelector((state) => {
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false' &&
            state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData = state.showData.dataSet[p.widgetKey][candleSelection];
            // console.log('CandleData', CandleData)
            return (showData);
        }
    });
    useImperativeHandle(ref, () => (
    //used to copy widgets when being dragged.
    {
        state: {
            candleSelection: candleSelection,
            chartData: chartData,
            options: options,
        },
    }));
    useEffect(() => {
        //On mount, use widget copy, else build visable data.
        //On update, if change in candle selection, rebuild visable data.
        if (isInitialMount.current && p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
            isInitialMount.current = false;
        }
        else {
            console.log("Loading Candle Widget");
            if (isInitialMount.current === true) {
                isInitialMount.current = false;
            }
            const payload = {
                key: p.widgetKey,
                securityList: [[`${candleSelection}`]]
            };
            dispatch(rBuildVisableData(payload));
        }
    }, [candleSelection, p.widgetKey, p.widgetCopy, dispatch]);
    useEffect((filters = p.filters, update = p.updateWidgetFilters, key = p.widgetKey) => {
        //Setup filters if not yet done.
        if (filters['startDate'] === undefined) {
            console.log("Setting up candles filters");
            const startDateSetBack = 31536000 * 1000; //1 week
            const endDateSetBack = 0;
            update(key, 'resolution', 'W');
            update(key, 'startDate', startDateSetBack);
            update(key, 'endDate', endDateSetBack);
            update(key, 'Description', 'Date numbers are millisecond offset from now. Used for Unix timestamp calculations.');
        }
        // }
    }, [p.filters, p.updateWidgetFilters, p.widgetKey]);
    useEffect(() => {
        //if stock not selected default to first stock.
        if (Object.keys(p.trackedStocks).length > 0 && candleSelection === '') {
            const setDefault = p.trackedStocks[Object.keys(p.trackedStocks)[0]].key;
            setCandleSelection(setDefault);
        }
    }, [p.trackedStocks, candleSelection]);
    useEffect(() => {
        //CREATE CANDLE DATA
        console.log("Calculating candle data");
        if (rShowData !== undefined && Object.keys(rShowData).length > 0) {
            const data = rShowData; //returned from finnHub API
            if (isCandleData(data)) {
                const nodeCount = data["c"].length;
                const chartData = [];
                for (let nodei = 0; nodei < nodeCount; nodei++) {
                    const yData = [
                        data["o"][nodei],
                        data["h"][nodei],
                        data["l"][nodei],
                        data["c"][nodei]
                    ];
                    const newNode = {
                        x: new Date(data["t"][nodei] * 1000),
                        y: yData, //open, high, low, close
                    };
                    chartData.push(newNode);
                    setChartData(chartData);
                }
                //SET CHART OPTIONS
                const now = Date.now();
                const startUnixOffset = p.filters.startDate !== undefined ? p.filters.startDate : 604800 * 1000;
                const startUnix = now - startUnixOffset;
                const endUnixOffset = p.filters.startDate !== undefined ? p.filters.endDate : 0;
                const endUnix = now - endUnixOffset;
                const startDate = new Date(startUnix).toISOString().slice(0, 10);
                const endDate = new Date(endUnix).toISOString().slice(0, 10);
                const options = {
                    width: 400,
                    height: 200,
                    theme: "light2",
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
                setOptions(options);
                // }
            }
        }
    }, [candleSelection, rShowData, p.filters.endDate, p.filters.startDate]);
    function updateWidgetList(stock) {
        if (stock.indexOf(":") > 0) {
            const stockSymbole = stock.slice(0, stock.indexOf(":"));
            p.updateWidgetStockList(p.widgetKey, stockSymbole);
        }
        else {
            p.updateWidgetStockList(p.widgetKey, stock);
        }
    }
    function updateFilter(e) {
        // const target = e.target;
        // const name = target.name;
        if (isNaN(new Date(e.target.value).getTime()) === false) {
            const now = Date.now();
            const target = new Date(e.target.value).getTime();
            const offset = now - target;
            const name = e.target.name;
            p.updateWidgetFilters(p.widgetKey, name, offset);
        }
        else {
            p.updateWidgetFilters(p.widgetKey, e.target.name, e.target.value);
        }
    }
    function changeStockSelection(e) {
        const target = e.target.value;
        const key = `${p.widgetKey}-${target}`;
        setCandleSelection(target);
        // @ts-ignore: Unreachable code error
        dispatch(tSearchMongoDB([key]));
    }
    function editCandleListForm() {
        let candleList = Object.keys(p.trackedStocks);
        let candleSelectionRow = candleList.map((el) => p.showEditPane === 1 ? (React.createElement("tr", { key: el + "container" },
            React.createElement("td", { key: el + "name" }, p.trackedStocks[el].dStock(p.exchangeList)),
            React.createElement("td", { key: el + "buttonC" },
                React.createElement("button", { key: el + "button", onClick: () => {
                        updateWidgetList(el);
                    } },
                    React.createElement("i", { className: "fa fa-times", "aria-hidden": "true", key: el + "icon" }))))) : (React.createElement("tr", { key: el + "pass" })));
        let stockCandleTable = (React.createElement("table", null,
            React.createElement("tbody", null, candleSelectionRow)));
        return stockCandleTable;
    }
    function displayCandleGraph() {
        let newSymbolList = Object.keys(p.trackedStocks).map((el) => (React.createElement("option", { key: el + "ddl", value: el }, p.trackedStocks[el].dStock(p.exchangeList))));
        let symbolSelectorDropDown = (React.createElement(React.Fragment, null,
            React.createElement("div", { className: "div-inline" },
                "  Selection:  ",
                React.createElement("select", { className: "btn", value: candleSelection, onChange: changeStockSelection }, newSymbolList)),
            React.createElement("div", { className: "graphDiv" },
                React.createElement(CreateCandleStickChart, { candleData: options }))));
        return symbolSelectorDropDown;
    }
    let resolutionList = ['1', '5', '15', '30', '60', "D", "W", "M"].map((el) => (React.createElement("option", { key: el + "rsl", value: el }, el)));
    const now = Date.now();
    const startUnixOffset = p.filters.startDate !== undefined ? p.filters.startDate : 604800 * 1000;
    const startUnix = now - startUnixOffset;
    const endUnixOffset = p.filters.startDate !== undefined ? p.filters.endDate : 0;
    const endUnix = now - endUnixOffset;
    const startDate = new Date(startUnix).toISOString().slice(0, 10);
    const endDate = new Date(endUnix).toISOString().slice(0, 10);
    return (React.createElement(React.Fragment, null,
        p.showEditPane === 1 && (React.createElement(React.Fragment, null,
            React.createElement("div", { className: "searchPane" },
                React.createElement(StockSearchPane, searchPaneProps(p)),
                React.createElement("div", { className: "stockSearch" },
                    React.createElement("form", { className: "form-inline" },
                        React.createElement("label", { htmlFor: "start" }, "Start date:"),
                        React.createElement("input", { className: "btn", id: "start", type: "date", name: "startDate", onChange: updateFilter, value: startDate }),
                        React.createElement("label", { htmlFor: "end" }, "End date:"),
                        React.createElement("input", { className: "btn", id: "end", type: "date", name: "endDate", onChange: updateFilter, value: endDate }),
                        React.createElement("label", { htmlFor: "resBtn" }, "Resolution:"),
                        React.createElement("select", { id: "resBtn", className: "btn", name: 'resolution', value: p.filters.resolution, onChange: updateFilter }, resolutionList)))),
            React.createElement("div", null, Object.keys(p.trackedStocks).length > 0 ? editCandleListForm() : React.createElement(React.Fragment, null)))),
        p.showEditPane === 0 && (Object.keys(p.trackedStocks).length > 0 ? displayCandleGraph() : React.createElement(React.Fragment, null))));
}
export default forwardRef(PriceCandles);
export function candleWidgetProps(that, key = "Candles") {
    let propList = {
        defaultExchange: that.props.defaultExchange,
        exchangeList: that.props.exchangeList,
        filters: that.props.widgetList[key]["filters"],
        showPane: that.showPane,
        trackedStocks: that.props.widgetList[key]["trackedStocks"],
        updateDefaultExchange: that.props.updateDefaultExchange,
        updateGlobalStockList: that.props.updateGlobalStockList,
        updateWidgetFilters: that.props.updateWidgetFilters,
        updateWidgetStockList: that.props.updateWidgetStockList,
        widgetKey: key,
    };
    return propList;
}
export const candleWidgetFilters = {
    resolution: 'W',
    startDate: 31536000000,
    "endDate": 0,
    "Description": 'Date numbers are millisecond offset from now. Used for Unix timestamp calculations.'
};
