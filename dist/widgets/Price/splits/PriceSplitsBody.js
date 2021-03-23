import * as React from "react";
import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { rBuildVisableData } from '../../../slices/sliceShowData';
import { tSearchMongoDB } from '../../../thunks/thunkSearchMongoDB';
import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";
const useDispatch = useAppDispatch;
const useSelector = useAppSelector;
function isFinnHubSplitList(arg) {
    if (arg !== undefined && Object.keys(arg).length > 0 && arg[0].date) {
        console.log("returning true", arg);
        return true;
    }
    else {
        console.log("returning false", arg);
        return false;
    }
}
function PriceSplits(p, ref) {
    const startingstockData = () => {
        if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
            return (p.widgetCopy.stockData);
        }
        else {
            return ([]);
        }
    };
    const startingTargetStock = () => {
        if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
            return (p.widgetCopy.targetSTock);
        }
        else {
            return ('');
        }
    };
    const [stockData, setStockData] = useState(startingstockData());
    const [targetStock, setTargetStock] = useState(startingTargetStock());
    const isInitialMount = useRef(true);
    const dispatch = useDispatch();
    const rShowData = useSelector((state) => {
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false' &&
            state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData = state.showData.dataSet[p.widgetKey][targetStock];
            return (showData);
        }
    });
    useImperativeHandle(ref, () => (
    //used to copy widgets when being dragged.
    {
        state: {
            stockData: stockData,
            targetStock: targetStock,
        },
    }));
    useEffect(() => {
        //On mount, use widget copy, else build visable data.
        //On update, if change in candle selection, rebuild visable data.
        if (isInitialMount.current && p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
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
            dispatch(rBuildVisableData(payload));
        }
    }, [targetStock, p.widgetKey, p.widgetCopy, dispatch]);
    useEffect((filters = p.filters, update = p.updateWidgetFilters, key = p.widgetKey) => {
        //Setup filters if not yet done.
        if (filters['startDate'] === undefined) {
            const startDateOffset = -604800 * 1000 * 52 * 20; //20 year backward. Limited to 1 year on free version.
            const endDateOffset = 0; //today.
            update(key, 'startDate', startDateOffset);
            update(key, 'endDate', endDateOffset);
            update(key, 'Description', 'Date numbers are millisecond offset from now. Used for Unix timestamp calculations.');
        }
    }, [p.filters, p.updateWidgetFilters, p.widgetKey]);
    useEffect(() => {
        //if stock not selected default to first stock.
        if (Object.keys(p.trackedStocks).length > 0 && targetStock === '') {
            const setDefault = p.trackedStocks[Object.keys(p.trackedStocks)[0]].key;
            setTargetStock(setDefault);
        }
    }, [p.trackedStocks, targetStock]);
    useEffect(() => {
        if (isFinnHubSplitList(rShowData) === true) {
            setStockData(rShowData);
        }
    }, [rShowData]);
    function updateFilter(e) {
        if (isNaN(new Date(e.target.value).getTime()) === false) {
            const now = Date.now();
            const target = new Date(e.target.value).getTime();
            const offset = target - now;
            const name = e.target.name;
            p.updateWidgetFilters(p.widgetKey, name, offset);
        }
    }
    function renderSearchPane() {
        //add search pane rendering logic here. Additional filters need to be added below.
        const stockList = Object.keys(p.trackedStocks);
        const stockListRows = stockList.map((el) => React.createElement("tr", { key: el + "container" },
            React.createElement("td", { key: el + "name" }, p.trackedStocks[el].dStock(p.exchangeList)),
            React.createElement("td", { key: el + "buttonC" },
                React.createElement("button", { key: el + "button", onClick: () => {
                        p.updateWidgetStockList(p.widgetKey, el);
                    } },
                    React.createElement("i", { className: "fa fa-times", "aria-hidden": "true", key: el + "icon" })))));
        const now = Date.now();
        const startUnixOffset = p.filters.startDate !== undefined ? p.filters.startDate : -604800 * 1000 * 52;
        const startUnix = now + startUnixOffset;
        const endUnixOffset = p.filters.startDate !== undefined ? p.filters.endDate : 0;
        const endUnix = now + endUnixOffset;
        const startDate = new Date(startUnix).toISOString().slice(0, 10);
        const endDate = new Date(endUnix).toISOString().slice(0, 10);
        let searchForm = (React.createElement(React.Fragment, null,
            React.createElement("div", { className: "stockSearch" },
                React.createElement("form", { className: "form-inline" },
                    React.createElement("label", { htmlFor: "start" }, "Start date:"),
                    React.createElement("input", { className: "btn", id: "start", type: "date", name: "startDate", onChange: updateFilter, value: startDate }),
                    React.createElement("label", { htmlFor: "end" }, "End date:"),
                    React.createElement("input", { className: "btn", id: "end", type: "date", name: "endDate", onChange: updateFilter, value: endDate }))),
            React.createElement("table", null,
                React.createElement("tbody", null, stockListRows))));
        return searchForm;
    }
    function stockTable() {
        // console.log('stockData', stockData)
        if (stockData.sort) {
            let sortedData = stockData.sort((a, b) => (new Date(a.date) > new Date(b.date) ? 1 : -1));
            let tableData = sortedData.map((el) => {
                return React.createElement("tr", { key: "row" + el.date },
                    React.createElement("td", null, el.date),
                    React.createElement("td", null, el.fromFactor),
                    React.createElement("td", null, el.toFactor));
            });
            return tableData;
        }
    }
    function changeStockSelection(e) {
        const target = e.target.value;
        const key = `${p.widgetKey}-${target}`;
        setTargetStock(target);
        dispatch(tSearchMongoDB([key]));
    }
    function renderStockData() {
        let newStockList = Object.keys(p.trackedStocks).map((el) => (React.createElement("option", { key: el + "ddl", value: el }, p.trackedStocks[el].dStock(p.exchangeList))));
        if (stockData !== undefined) {
            let symbolSelectorDropDown = (React.createElement(React.Fragment, null,
                React.createElement("div", { className: "div-inline" },
                    "  Stock:  ",
                    React.createElement("select", { className: "btn", value: targetStock, onChange: changeStockSelection }, newStockList)),
                React.createElement("table", null,
                    React.createElement("thead", null,
                        React.createElement("tr", null,
                            React.createElement("td", null, "Date"),
                            React.createElement("td", null, "From:"),
                            React.createElement("td", null, "To:"))),
                    React.createElement("tbody", null, stockTable()))));
            return symbolSelectorDropDown;
        }
    }
    return (React.createElement(React.Fragment, null,
        p.showEditPane === 1 && (React.createElement(React.Fragment, null,
            React.createElement(StockSearchPane, searchPaneProps(p)),
            renderSearchPane())),
        p.showEditPane === 0 && (React.createElement(React.Fragment, null, renderStockData()))));
}
export default forwardRef(PriceSplits);
export function PriceSplitsProps(that, key = "newWidgetNameProps") {
    let propList = {
        apiKey: that.props.apiKey,
        showPane: that.showPane,
        trackedStocks: that.props.widgetList[key]["trackedStocks"],
        filters: that.props.widgetList[key]["filters"],
        updateWidgetFilters: that.props.updateWidgetFilters,
        updateGlobalStockList: that.props.updateGlobalStockList,
        updateWidgetStockList: that.props.updateWidgetStockList,
        widgetKey: key,
        throttle: that.props.throttle,
        exchangeList: that.props.exchangeList,
        defaultExchange: that.props.defaultExchange,
        updateDefaultExchange: that.props.updateDefaultExchange,
    };
    return propList;
}
export const priceSplitsFilters = {
    startDate: -604800 * 1000 * 52 * 20,
    endDate: 0,
    "Description": 'Date numbers are millisecond offset from now. Used for Unix timestamp calculations.'
};
