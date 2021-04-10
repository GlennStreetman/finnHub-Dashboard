import * as React from "react";
import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";
import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";
import { tSearchMongoDB } from '../../../thunks/thunkSearchMongoDB';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { rBuildVisableData } from '../../../slices/sliceShowData';
const useDispatch = useAppDispatch;
const useSelector = useAppSelector;
//add any additional type guard functions here used for live code.
function isFinnHubData(arg) {
    if (arg !== undefined && Object.keys(arg).length > 0 && arg[0].accessNumber) {
        // console.log("returning true", arg)
        return true;
    }
    else {
        // console.log("returning false", arg)
        return false;
    }
}
function FundamentalsSECFilings(p, ref) {
    const isInitialMount = useRef(true); //update to false after first render.
    const startingstockData = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
                const stockData = JSON.parse(JSON.stringify(p.widgetCopy.stockData));
                return (stockData);
            }
            else {
                return ([]);
            }
        }
    };
    const startingTargetStock = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
                const targetStock = p.widgetCopy.targetStock;
                return (targetStock);
            }
            else {
                return ('');
            }
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
    const startingPagination = () => {
        if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
            return (p.widgetCopy.pageinationInt);
        }
        else {
            return (1);
        }
    };
    const [widgetCopy] = useState(startingWidgetCoptyRef());
    const [stockData, setStockData] = useState(startingstockData());
    const [targetStock, setTargetStock] = useState(startingTargetStock());
    const [pageinationInt, setPageinationInt] = useState(startingPagination());
    const dispatch = useDispatch(); //allows widget to run redux actions.
    const rShowData = useSelector((state) => {
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false' &&
            state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData = state.showData.dataSet[p.widgetKey][targetStock];
            return (showData);
        }
    });
    useImperativeHandle(ref, () => (
    //used to copy widgets when being dragged. example: if widget body renders time series data into chart, copy chart data.
    //add additional slices of state to list if they help reduce re-render time.
    {
        state: {
            stockData: stockData,
            targetStock: targetStock,
            pageinationInt: pageinationInt,
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
                securityList: [[`${targetStock}`]]
            };
            console.log(payload);
            dispatch(rBuildVisableData(payload));
        }
    }, [targetStock, p.widgetKey, widgetCopy, dispatch]);
    useEffect(() => {
        //DELETE IF NO TARGET STOCK
        //if stock not selected default to first stock.
        if (Object.keys(p.trackedStocks).length > 0 && targetStock === '') {
            const setDefault = p.trackedStocks[Object.keys(p.trackedStocks)[0]].key;
            setTargetStock(setDefault);
        }
    }, [p.trackedStocks, targetStock]);
    useEffect(() => {
        if (isFinnHubData(rShowData) === true) {
            setStockData(rShowData);
        }
        else {
            setStockData([]);
        }
    }, [rShowData]);
    useEffect(() => {
        if (p.targetSecurity !== '') {
            const target = `${p.widgetKey}-${p.targetSecurity}`;
            setTargetStock(p.targetSecurity);
            dispatch(tSearchMongoDB([target]));
        }
    }, [p.targetSecurity, p.widgetKey, dispatch]);
    function changeIncrement(e) {
        const newpageinationInt = pageinationInt + e;
        if (newpageinationInt > 0 && newpageinationInt < 251)
            setPageinationInt(newpageinationInt);
    }
    function changeStockSelection(e) {
        const target = e.target.value;
        const key = `${p.widgetKey}-${target}`;
        setTargetStock(target);
        dispatch(tSearchMongoDB([key]));
        setPageinationInt(pageinationInt);
    }
    function formatURLS(e) {
        if (e.includes("http")) {
            return React.createElement("a", { href: e, target: "_blank", rel: "noopener noreferrer" }, e.slice(0, 21) + '...');
        }
        else
            return e;
    }
    function stockTable(data) {
        if (data !== undefined) {
            let tableData = Object.keys(data).map((el) => React.createElement("tr", { key: "row" + el },
                React.createElement("td", { key: "heading" + el }, el),
                React.createElement("td", { key: "value" + el }, formatURLS(data[el]))));
            return tableData;
        }
        else {
            return React.createElement(React.Fragment, null);
        }
    }
    function renderSearchPane() {
        let stockList = Object.keys(p.trackedStocks);
        let row = stockList.map((el) => p.showEditPane === 1 ? (React.createElement("tr", { key: el + "container" },
            React.createElement("td", { key: el + "name" }, p.trackedStocks[el].dStock(p.exchangeList)),
            React.createElement("td", { key: el + "buttonC" },
                React.createElement("button", { key: el + "button", onClick: () => {
                        p.updateWidgetStockList(p.widgetKey, el);
                    } },
                    React.createElement("i", { className: "fa fa-times", "aria-hidden": "true", key: el + "icon" }))))) : (React.createElement("tr", { key: el + "pass" })));
        let stockListTable = (React.createElement("table", null,
            React.createElement("tbody", null, row)));
        return React.createElement(React.Fragment, null, stockListTable);
    }
    function renderStockData() {
        const newSymbolList = Object.keys(p.trackedStocks).map((el) => (React.createElement("option", { key: el + "ddl", value: el }, p.trackedStocks[el].dStock(p.exchangeList))));
        const currentFiling = stockData[pageinationInt];
        const symbolSelectorDropDown = (React.createElement(React.Fragment, null,
            React.createElement("div", null,
                React.createElement("select", { value: targetStock, onChange: changeStockSelection }, newSymbolList),
                React.createElement("button", { onClick: () => changeIncrement(-1) },
                    React.createElement("i", { className: "fa fa-backward", "aria-hidden": "true" })),
                React.createElement("button", { onClick: () => changeIncrement(1) },
                    React.createElement("i", { className: "fa fa-forward", "aria-hidden": "true" })))));
        const stockDataTable = (React.createElement(React.Fragment, null,
            symbolSelectorDropDown,
            React.createElement("div", null,
                React.createElement("table", null,
                    React.createElement("thead", null,
                        React.createElement("tr", null,
                            React.createElement("td", null, "Heading"),
                            React.createElement("td", null, "Value"))),
                    React.createElement("tbody", null, stockTable(currentFiling))))));
        return stockDataTable;
    }
    return (React.createElement(React.Fragment, null,
        p.showEditPane === 1 && (React.createElement(React.Fragment, null,
            React.createElement(StockSearchPane, searchPaneProps(p)),
            renderSearchPane())),
        p.showEditPane === 0 && (React.createElement(React.Fragment, null, renderStockData()))));
}
export default forwardRef(FundamentalsSECFilings);
export function secFilingsProps(that, key = "newWidgetNameProps") {
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
//# sourceMappingURL=secFilingsBody.js.map