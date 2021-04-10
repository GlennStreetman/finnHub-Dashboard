import * as React from "react";
import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { rBuildVisableData } from '../../../slices/sliceShowData';
import { tSearchMongoDB } from '../../../thunks/thunkSearchMongoDB';
import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";
const useDispatch = useAppDispatch;
const useSelector = useAppSelector;
//add any additional type guard functions here used for live code.
function isFinnHubData(arg) {
    if (arg !== undefined && Object.keys(arg).length > 0 && arg[0].category) {
        // console.log("returning true", arg)
        return true;
    }
    else {
        // console.log("returning false", arg)
        return false;
    }
}
//RENAME FUNCTION
function FundamentalsCompanyNews(p, ref) {
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
    const startingNewIncrementor = () => {
        if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
            return (p.widgetCopy.newsIncrementor);
        }
        else {
            return (1);
        }
    };
    const [widgetCopy] = useState(startingWidgetCoptyRef());
    const [stockData, setStockData] = useState(startingstockData());
    const [targetStock, setTargetStock] = useState(startingTargetStock());
    const [newsIncrementor, setNewsIncrementor] = useState(startingNewIncrementor());
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
            newsIncrementor: newsIncrementor,
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
    useEffect((filters = p.filters, update = p.updateWidgetFilters, key = p.widgetKey) => {
        if (filters['startDate'] === undefined) {
            const startDateOffset = 604800 * 1000; //1 week
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
        console.log("setting stock data", rShowData);
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
    function updateFilter(e) {
        if (isNaN(new Date(e.target.value).getTime()) === false) {
            const now = Date.now();
            const target = new Date(e.target.value).getTime();
            const offset = target - now;
            const name = e.target.name;
            p.updateWidgetFilters(p.widgetKey, name, offset);
        }
    }
    function formatSourceName(source) {
        //clean up source names for news articles.
        let formattedSource = source;
        formattedSource = formattedSource.replace(".com", "");
        formattedSource = formattedSource.replace("http:", "");
        formattedSource = formattedSource.replace("https:", "");
        formattedSource = formattedSource.replace("//", "");
        formattedSource = formattedSource.replace("www.", "");
        formattedSource = formattedSource.replace("wsj", "Wall Street Journal");
        formattedSource = formattedSource.replace(formattedSource[0], formattedSource[0].toUpperCase());
        return formattedSource;
    }
    function shortHeadline(headline) {
        let shortHeadLine = headline.slice(0, 32) + "...";
        return shortHeadLine;
    }
    function changeIncrememnt(e) {
        const newIncrement = newsIncrementor + e;
        if (newIncrement > 0 && newIncrement < 11)
            setNewsIncrementor(newIncrement);
    }
    function updateWidgetList(stock) {
        if (stock.indexOf(":") > 0) {
            const stockSymbole = stock.slice(0, stock.indexOf(":"));
            p.updateWidgetStockList(p.widgetKey, stockSymbole);
        }
        else {
            p.updateWidgetStockList(p.widgetKey, stock);
        }
    }
    function editNewsListForm() {
        let newsList = Object.keys(p.trackedStocks);
        let stockNewsRow = newsList.map((el) => p.showEditPane === 1 ? (React.createElement("tr", { key: el + "container" },
            React.createElement("td", { key: el + "name" }, (p.trackedStocks[el].dStock(p.exchangeList))),
            React.createElement("td", { key: el + "buttonC" },
                React.createElement("button", { key: el + "button", onClick: () => {
                        updateWidgetList(el);
                    } },
                    React.createElement("i", { className: "fa fa-times", "aria-hidden": "true", key: el + "icon" }))))) : (React.createElement("tr", { key: el + "pass" })));
        let stockNewsTable = (React.createElement("table", null,
            React.createElement("tbody", null, stockNewsRow)));
        return stockNewsTable;
    }
    function newsTable() {
        let increment = 10 * newsIncrementor;
        let newStart = increment - 10;
        let newsEnd = increment;
        // console.log('stockData', stockData)
        let newsSlice = stockData.slice(newStart, newsEnd);
        let mapNews = newsSlice.map((el, index) => (React.createElement("tr", { key: el + "newsRow" + index },
            React.createElement("td", { key: el + "newsSource" }, formatSourceName(el["source"])),
            React.createElement("td", { key: el + "newsHeadline" },
                React.createElement("a", { key: el + "newsUrl", href: el["url"], target: "_blank", rel: "noopener noreferrer" }, shortHeadline(el["headline"]))))));
        let thisnewsTable = (React.createElement("div", { className: "newsBody" },
            React.createElement("table", null,
                React.createElement("thead", null,
                    React.createElement("tr", null,
                        React.createElement("td", null, "Source"),
                        React.createElement("td", null, "Headline"))),
                React.createElement("tbody", null, mapNews))));
        return thisnewsTable;
    }
    function displayNews() {
        let newSymbolList = Object.keys(p.trackedStocks).map((el) => (React.createElement("option", { key: el + "ddl", value: el }, p.trackedStocks[el].dStock(p.exchangeList))));
        let symbolSelectorDropDown = (React.createElement(React.Fragment, null,
            React.createElement("div", null,
                React.createElement("select", { value: targetStock, onChange: changeStockSelection }, newSymbolList),
                React.createElement("button", { onClick: () => changeIncrememnt(-1) },
                    React.createElement("i", { className: "fa fa-backward", "aria-hidden": "true" })),
                React.createElement("button", { onClick: () => changeIncrememnt(1) },
                    React.createElement("i", { className: "fa fa-forward", "aria-hidden": "true" }))),
            React.createElement("div", null, newsTable())));
        return symbolSelectorDropDown;
    }
    function renderSearchPane() {
        const now = Date.now();
        const startUnixOffset = p.filters.startDate !== undefined ? p.filters.startDate : 604800 * 1000;
        const startUnix = now - startUnixOffset;
        const endUnixOffset = p.filters.startDate !== undefined ? p.filters.endDate : 0;
        const endUnix = now - endUnixOffset;
        const startDate = new Date(startUnix).toISOString().slice(0, 10);
        const endDate = new Date(endUnix).toISOString().slice(0, 10);
        return (React.createElement(React.Fragment, null,
            React.createElement("div", { className: "stockSearch" },
                React.createElement("form", { className: "form-stack" },
                    React.createElement("label", { htmlFor: "start" }, "Start date:"),
                    React.createElement("input", { className: "btn", id: "start", type: "date", name: "startDate", onChange: updateFilter, value: startDate }),
                    React.createElement("br", null),
                    React.createElement("label", { htmlFor: "end" }, "End date:"),
                    React.createElement("input", { className: "btn", id: "end", type: "date", name: "endDate", onChange: updateFilter, value: endDate }))),
            React.createElement("div", null, Object.keys(p.trackedStocks).length > 0 ? editNewsListForm() : React.createElement(React.Fragment, null))));
    }
    function changeStockSelection(e) {
        const target = e.target.value;
        const key = `${p.widgetKey}-${target}`;
        console.log("HERE", target, key);
        setTargetStock(target);
        dispatch(tSearchMongoDB([key]));
        setNewsIncrementor(1);
    }
    function renderStockData() {
        return (React.createElement("div", null, Object.keys(p.trackedStocks).length > 0 ? displayNews() : React.createElement(React.Fragment, null)));
    }
    return (React.createElement(React.Fragment, null,
        p.showEditPane === 1 && (React.createElement(React.Fragment, null,
            React.createElement(StockSearchPane, searchPaneProps(p)),
            renderSearchPane())),
        p.showEditPane === 0 && (React.createElement(React.Fragment, null, renderStockData()))));
}
//RENAME
export default forwardRef(FundamentalsCompanyNews);
//RENAME
export function newsWidgetProps(that, key = "newWidgetNameProps") {
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
//rename
export const companyNewsFilters = {
    startDate: 604800 * 1000,
    endDate: 0,
    Description: 'Date numbers are millisecond offset from now. Used for Unix timestamp calculations.'
};
//# sourceMappingURL=companyNewsBody.js.map