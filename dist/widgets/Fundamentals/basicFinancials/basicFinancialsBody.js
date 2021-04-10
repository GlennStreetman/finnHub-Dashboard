import * as React from "react";
import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { rBuildVisableData } from '../../../slices/sliceShowData';
// import { tSearchMongoDB } from '../../../thunks/thunkSearchMongoDB'
import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";
const useDispatch = useAppDispatch;
const useSelector = useAppSelector;
//add any additional type guard functions here used for live code.
function isFinnHubData(arg) {
    // console.log('!arg', arg)
    if (arg !== undefined && Object.keys(arg).length > 0 && arg[Object.keys(arg)[0]].symbol) {
        return true;
    }
    else {
        return false;
    }
}
function FundamentalsBasicFinancials(p, ref) {
    const isInitialMount = useRef(true); //update to false after first render.
    const startingstockData = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
                const copyData = JSON.parse(JSON.stringify(p.widgetCopy.stockData));
                return (copyData);
            }
            else {
                const newData = {};
                return (newData);
            }
        }
        else {
            return ({});
        }
    };
    const startMetricList = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
                const copyData = JSON.parse(JSON.stringify(p.widgetCopy.metricList));
                return (copyData);
            }
            else {
                const newData = [];
                return (newData);
            }
        }
        else {
            return ([]);
        }
    };
    const startingWidgetCoptyRef = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy !== undefined && p.widgetCopy.widgetID !== null) {
                return p.widgetCopy.widgetID;
            }
            else {
                return -1;
            }
        }
    };
    const [widgetCopy] = useState(startingWidgetCoptyRef());
    const [stockData, setStockData] = useState(startingstockData()); //data for each stock.
    const [metricList, setMetricList] = useState(startMetricList()); //metricList target stocks available metrics
    const [metricIncrementor, setMetricIncrementor] = useState(1);
    const [orderView, setOrderView] = useState(0);
    const [symbolView, setSymbolView] = useState(0);
    const dispatch = useDispatch(); //allows widget to run redux actions.
    const rShowData = useSelector((state) => {
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false' &&
            state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData = state.showData.dataSet[p.widgetKey];
            return (showData);
        }
    });
    useImperativeHandle(ref, () => (
    //used to copy widgets when being dragged. example: if widget body renders time series data into chart, copy chart data.
    //add additional slices of state to list if they help reduce re-render time.
    {
        state: {
            stockData: stockData,
            metricList: metricList,
            metricIncrementor: metricIncrementor,
            orderView: orderView,
            symbolView: symbolView,
        },
    }));
    useEffect(() => {
        //On mount, use widget copy, else build visable data.
        //On update, if change in target stock, rebuild visable data.
        if (isInitialMount.current === true && widgetCopy === p.widgetKey) {
            isInitialMount.current = false;
        }
        else {
            if (isInitialMount.current === true) {
                isInitialMount.current = false;
            }
            const payload = {
                key: p.widgetKey,
                securityList: Object.keys(p.trackedStocks)
            };
            dispatch(rBuildVisableData(payload));
        }
    }, [p.widgetKey, widgetCopy, dispatch, p.trackedStocks]);
    useEffect((key = p.widgetKey, trackedStock = p.trackedStocks, keyList = Object.keys(p.trackedStocks), updateWidgetConfig = p.updateWidgetConfig) => {
        //Setup default metric source if none selected.
        if (p.config.metricSource === undefined) {
            const newSource = keyList.length > 0 ? trackedStock[keyList[0]].key : '';
            updateWidgetConfig(key, {
                metricSource: newSource,
                metricSelection: []
            });
        }
    }, [p.updateWidgetConfig, p.widgetKey, p.trackedStocks, p.apiKey, p.config.metricSource]);
    useEffect(() => {
        if (isFinnHubData(rShowData) === true) {
            const newData = {};
            for (const node in rShowData) {
                newData[node] = rShowData[node]['metric'];
            }
            setStockData(newData);
        }
        else {
            setStockData({});
        }
    }, [rShowData]);
    useEffect(() => {
        if (stockData[p.config.metricSource] !== undefined) {
            const newList = Object.keys(stockData[p.config.metricSource]) ?? [];
            // p.updateWidgetconfig(p.apiKey, 'metricList', newList)
            setMetricList(newList);
        }
    }, [stockData, p.config.metricSource]);
    function changeSource(el) {
        p.updateWidgetConfig(p.widgetKey, {
            metricList: [],
            metricSource: el,
        });
    }
    function changeOrder(indexRef, change) {
        //changes order that metric selections are displayed in.
        console.log(indexRef + ":" + change);
        let moveFrom = p.config.metricSelection[indexRef];
        let moveTo = p.config.metricSelection[indexRef + change];
        let orderMetricSelection = p.config.metricSelection.slice();
        orderMetricSelection[indexRef] = moveTo;
        orderMetricSelection[indexRef + change] = moveFrom;
        console.log(orderMetricSelection, moveFrom, moveTo, p.config.metricSelection.length);
        if (indexRef + change >= 0 && indexRef + change < p.config.metricSelection.length) {
            console.log('updating');
            p.updateWidgetConfig(p.widgetKey, {
                metricSelection: orderMetricSelection
            });
            // setMetricSelection(orderMetricSelection)
        }
    }
    function changeIncrememnt(e) {
        //pagination
        const newIncrement = metricIncrementor + e;
        if (newIncrement > 0 && newIncrement < metricList.length + 10)
            setMetricIncrementor(newIncrement);
    }
    function selectMetrics(metric) {
        if (p.config.metricSelection.indexOf(metric) < 0) {
            let newSelection = p.config.metricSelection.slice();
            newSelection.push(metric);
            p.updateWidgetConfig(p.widgetKey, { metricSelection: newSelection });
            // setMetricSelection(newSelection)
        }
        else {
            let newSelection = p.config.metricSelection.slice();
            newSelection.splice(newSelection.indexOf(metric), 1);
            p.updateWidgetConfig(p.widgetKey, { metricSelection: newSelection });
            // setMetricSelection(newSelection)
        }
    }
    function getMetrics() {
        let metricSelector = (React.createElement(React.Fragment, null,
            React.createElement("div", null,
                React.createElement("button", { onClick: () => changeIncrememnt(-1) },
                    React.createElement("i", { className: "fa fa-backward", "aria-hidden": "true" })),
                React.createElement("button", { onClick: () => changeIncrememnt(1) },
                    React.createElement("i", { className: "fa fa-forward", "aria-hidden": "true" })),
                symbolView === 0 && (React.createElement("button", { onClick: () => { orderView === 1 ? setOrderView(0) : setOrderView(1); } }, orderView === 0 ? 'Order' : 'Selection')),
                React.createElement("button", { onClick: () => { symbolView === 1 ? setSymbolView(0) : setSymbolView(1); } }, symbolView === 0 ? 'Stocks' : 'Metrics')),
            React.createElement("div", null, metricsTable())));
        return metricSelector;
    }
    function checkStatus(check) {
        //sets status of check boxes when selecting or deselecting checkboxes.
        if (p.config.metricSelection.indexOf(check) > -1) {
            return true;
        }
        else {
            return false;
        }
    }
    function metricsTable() {
        if (p.config.metricSelection !== undefined) {
            let increment = 10 * metricIncrementor;
            let start = increment - 10;
            let end = increment;
            let metricSlice = metricList.slice(start, end);
            let selectionSlice = p.config.metricSelection.slice(start, end);
            let stockSelectionSlice = Object.keys(p.trackedStocks).slice(start, end);
            // console.log(selectionSlice)
            let mapMetrics = metricSlice.map((el, index) => (React.createElement("tr", { key: el + "metricRow" + index },
                React.createElement("td", { key: el + "metricdesc" }, el),
                React.createElement("td", { key: el + "metricSelect" },
                    React.createElement("input", { type: "checkbox", key: el + "checkbox", onChange: () => selectMetrics(el), checked: checkStatus(el) })))));
            let mapMetricSelection = selectionSlice.map((el, index) => (React.createElement("tr", { key: el + "metricRow" + index },
                React.createElement("td", { key: el + "metricdesc" }, el),
                React.createElement("td", { key: el + "up" },
                    React.createElement("button", { onClick: () => changeOrder(index, -1) },
                        React.createElement("i", { className: "fa fa-sort-asc", "aria-hidden": "true" }))),
                React.createElement("td", { key: el + "down" },
                    React.createElement("button", { onClick: () => changeOrder(index, 1) },
                        React.createElement("i", { className: "fa fa-sort-desc", "aria-hidden": "true" }))))));
            let mapStockSelection = stockSelectionSlice.map((el, index) => (React.createElement("tr", { key: el + "metricRow" + index },
                React.createElement("td", { key: el + "metricdesc" }, p.trackedStocks[el].dStock(p.exchangeList)),
                React.createElement("td", null,
                    React.createElement("input", { type: 'radio', name: 'sourceStock', checked: p.config.metricSource === el, onChange: () => changeSource(el) })),
                React.createElement("td", { key: el + "remove" },
                    React.createElement("button", { onClick: () => { updateWidgetList(el); } },
                        React.createElement("i", { className: "fa fa-times", "aria-hidden": "true" }))))));
            let metricSelectTableheading = () => {
                if (symbolView === 1) {
                    return (React.createElement(React.Fragment, null,
                        React.createElement("td", null, "Stock"),
                        React.createElement("td", null, "Source"),
                        React.createElement("td", null, "Remove")));
                }
                else if (orderView === 0) {
                    return (React.createElement(React.Fragment, null,
                        React.createElement("td", null, "Metric"),
                        React.createElement("td", null, "Select")));
                }
                else {
                    return (React.createElement(React.Fragment, null,
                        React.createElement("td", null, "Metric"),
                        React.createElement("td", null, "Up"),
                        React.createElement("td", null, "Down")));
                }
            };
            let metricSelectTable = (React.createElement("div", { className: "widgetTableDiv" },
                React.createElement("table", { className: 'widgetBodyTable' },
                    React.createElement("thead", null,
                        React.createElement("tr", null, metricSelectTableheading())),
                    React.createElement("tbody", null,
                        orderView === 0 && symbolView === 0 && mapMetrics,
                        orderView === 1 && symbolView === 0 && mapMetricSelection,
                        symbolView === 1 && mapStockSelection))));
            return metricSelectTable;
        }
    }
    function updateWidgetList(stock) {
        // console.log("updating");
        if (stock.indexOf(":") > 0) {
            const stockSymbole = stock.slice(0, stock.indexOf(":"));
            p.updateWidgetStockList(p.widgetKey, stockSymbole);
        }
        else {
            p.updateWidgetStockList(p.widgetKey, stock);
        }
    }
    function mapStockData(symbol) {
        let symbolData = stockData[symbol];
        let findMetrics = p.config.metricSelection;
        // console.log(findMetrics)
        let returnMetrics = [];
        for (var x in findMetrics) {
            try {
                let metric = symbolData[findMetrics[x]];
                returnMetrics.push(metric.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }));
            }
            catch (err) {
                console.log('mapStockData err');
            }
        }
        // console.log(returnMetrics)
        let thisKey = p.widgetKey;
        let thisMetricList = returnMetrics.map((el, ind) => React.createElement("td", { className: "rightTE", key: thisKey + el + ind + "dat" }, el));
        return thisMetricList;
    }
    function renderStockData() {
        let selectionList = [];
        let thisKey = p.widgetKey;
        if (p.config.metricSelection !== undefined) {
            selectionList = p.config.metricSelection.slice();
        }
        let headerRows = selectionList.map((el) => {
            let title = el.replace(/([A-Z])/g, ' $1').trim().split(" ").join("\n");
            if (title.search(/\d\s[A-Z]/g) !== -1) {
                title = title.slice(0, title.search(/\d\s[A-Z]/g) + 1) + '-' + title.slice(title.search(/\d\s[A-Z]/g) + 2);
            }
            // console.log(title)
            title = title.replace(/T\sT\sM/g, 'TTM');
            // console.log(title)
            return (React.createElement("td", { className: 'tdHead', key: thisKey + el + "title" }, title));
        });
        let bodyRows = Object.keys(p.trackedStocks).map((el) => {
            return (React.createElement("tr", { key: thisKey + el + "tr1" },
                React.createElement("td", { key: thisKey + el + "td1" }, p.trackedStocks[el].dStock(p.exchangeList)),
                mapStockData(el)));
        });
        let buildTable = React.createElement("div", { className: "widgetTableDiv" },
            React.createElement("table", { className: 'widgetBodyTable' },
                React.createElement("thead", null,
                    React.createElement("tr", null,
                        React.createElement("td", { className: 'centerBottomTE' }, "Symbole:"),
                        headerRows)),
                React.createElement("tbody", null, bodyRows)));
        return buildTable;
    }
    return (React.createElement(React.Fragment, null,
        p.showEditPane === 1 && (React.createElement(React.Fragment, null,
            React.createElement(StockSearchPane, searchPaneProps(p)),
            getMetrics())),
        Object.keys(p.trackedStocks).length > 0 && p.showEditPane === 0 ? renderStockData() : React.createElement(React.Fragment, null)));
}
//RENAME
export default forwardRef(FundamentalsBasicFinancials);
//RENAME
export function metricsProps(that, key = "newWidgetNameProps") {
    let propList = {
        apiKey: that.props.apiKey,
        defaultExchange: that.props.defaultExchange,
        exchangeList: that.props.exchangeList,
        filters: that.props.widgetList[key]["filters"],
        showPane: that.showPane,
        trackedStocks: that.props.widgetList[key]["trackedStocks"],
        updateWidgetConfig: that.props.updateWidgetConfig,
        updateDefaultExchange: that.props.updateDefaultExchange,
        updateWidgetFilters: that.props.updateWidgetFilters,
        updateGlobalStockList: that.props.updateGlobalStockList,
        updateWidgetStockList: that.props.updateWidgetStockList,
        widgetKey: key,
    };
    return propList;
}
//# sourceMappingURL=basicFinancialsBody.js.map