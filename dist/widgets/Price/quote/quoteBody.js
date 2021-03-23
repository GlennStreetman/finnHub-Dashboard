import React from "react";
import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";
import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { rBuildVisableData } from '../../../slices/sliceShowData';
const useDispatch = useAppDispatch;
const useSelector = useAppSelector;
function isQuoteData(arg) {
    return arg.c !== undefined;
}
function PriceQuote(p, ref) {
    const startingStockData = () => {
        if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
            return (p.widgetCopy.stockData);
        }
        else {
            return ({});
        }
    };
    const [stockData, setStockData] = useState(startingStockData());
    const isInitialMount = useRef(true);
    const dispatch = useDispatch();
    const rShowData = useSelector((state) => {
        //redux connection
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false' &&
            state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData = state.showData.dataSet[p.widgetKey];
            // console.log("showdata", showData)
            return (showData);
        }
    });
    useImperativeHandle(ref, () => (
    //used to copy widgets when being dragged.
    {
        state: {
            stockData: stockData,
        },
    }));
    useEffect(() => {
        if (isInitialMount.current && p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
            isInitialMount.current = false;
        }
        else {
            console.log("Loading Quote Widget");
            const stockList = Object.keys(p.trackedStocks);
            const payload = {
                key: p.widgetKey,
                securityList: stockList,
            };
            dispatch(rBuildVisableData(payload));
        }
    }, [p.widgetKey, p.trackedStocks, p.widgetCopy, dispatch]);
    useEffect(() => {
        if (rShowData !== undefined && Object.keys(rShowData).length > 0) {
            const newData = {};
            for (const key in rShowData) {
                const data = rShowData[key];
                if (isQuoteData(data)) {
                    newData[key] = {
                        currentPrice: data.c,
                        dayHighPrice: data.h,
                        dayLowPrice: data.l,
                        dayOpenPrice: data.o,
                        prevClosePrice: data.pc,
                    };
                }
                // console.log('key', Object.keys(rShowData), key, data)
            }
            setStockData(newData);
        }
    }, [rShowData]);
    function returnKey(ref) {
        const retVal = ref !== undefined ? ref["currentPrice"] : "noDat";
        return retVal;
    }
    function findPrice(stock) {
        if (p.streamingPriceData[stock] !== undefined) {
            const sPrice = p.streamingPriceData[stock].currentPrice;
            const dayPrice = stockData[stock] ? stockData[stock].currentPrice : 0;
            const price = isNaN(sPrice) === false ? sPrice : dayPrice;
            return price;
        }
        else {
            const dayPrice = stockData[stock] ? stockData[stock].currentPrice : 0;
            return dayPrice;
        }
    }
    function renderStockData() {
        let pd = stockData;
        let widgetStockList = Object.keys(p.trackedStocks);
        // console.log("WIDGETSTOCKLIST", widgetStockList, pd['US-TSLA'], widgetStockList[0])
        let stockDetailRow = widgetStockList.map((el) => pd[el] ? (React.createElement("tr", { key: el + "st" + +pd[el]["currentPrice"] },
            React.createElement("td", { key: el + "id" }, p.trackedStocks[el].dStock(p.exchangeList)),
            React.createElement("td", { className: "rightTE", key: el + "prevClosePrice" }, pd[el]["prevClosePrice"].toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })),
            React.createElement("td", { className: "rightTE", key: el + "dayOpenPrice" }, pd[el]["dayOpenPrice"].toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })),
            React.createElement("td", { className: "rightTE", key: el + "dayLowPrice" }, pd[el]["dayLowPrice"].toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })),
            React.createElement("td", { className: "rightTE", key: el + "dayHighPrice" }, pd[el]["dayHighPrice"].toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })),
            React.createElement("td", { className: 'rightTEFade', key: el + "currentPrice" + returnKey(p.streamingPriceData[el]) }, findPrice(el).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })),
            p.showEditPane === 1 ? (React.createElement("td", { className: "rightTE", key: el + "buttonBox" },
                React.createElement("button", { key: el + "button", onClick: () => {
                        p.updateWidgetStockList(p.widgetKey, el);
                    } },
                    React.createElement("i", { className: "fa fa-times", "aria-hidden": "true" })))) : (React.createElement(React.Fragment, null)))) : (React.createElement("tr", { key: el + "" })));
        let buildTable = (React.createElement("table", { className: "widgetBodyTable", key: p.widgetKey + "id" },
            React.createElement("thead", { key: p.widgetKey + "head" },
                React.createElement("tr", { key: p.widgetKey + "tr" },
                    React.createElement("td", { key: p.widgetKey + "stock" }, "Symbole:"),
                    React.createElement("td", { className: "centerTE", key: p.widgetKey + "close" }, "Prev Close"),
                    React.createElement("td", { className: "centerTE", key: p.widgetKey + "open" }, "Day Open"),
                    React.createElement("td", { className: "centerTE", key: p.widgetKey + "low" }, "Day Low"),
                    React.createElement("td", { className: "centerTE", key: p.widgetKey + "high" }, "Day High"),
                    React.createElement("td", { className: "centerTE", key: p.widgetKey + "price" }, "Price"),
                    p.showEditPane === 1 ? React.createElement("td", { key: p.widgetKey + "remove" }, "Remove") : React.createElement(React.Fragment, null))),
            React.createElement("tbody", { key: p.widgetKey + "body" }, stockDetailRow)));
        // console.log('buildTable', buildTable)
        return buildTable;
    }
    return (React.createElement(React.Fragment, null,
        p.showEditPane === 1 && (React.createElement(StockSearchPane, searchPaneProps(p))),
        Object.keys(p.streamingPriceData).length > 0 ? renderStockData() : React.createElement(React.Fragment, null)));
}
export default forwardRef(PriceQuote);
export function quoteBodyProps(that, key = "Quote") {
    let propList = {
        apiKey: that.props.apiKey,
        showPane: that.showPane,
        trackedStocks: that.props.widgetList[key]["trackedStocks"],
        streamingPriceData: that.props.streamingPriceData,
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
