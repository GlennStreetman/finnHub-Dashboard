import * as React from "react";
import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { rBuildVisableData } from '../../../slices/sliceShowData';
const useDispatch = useAppDispatch;
const useSelector = useAppSelector;
//add any additional type guard functions here used for live code.
function isFinnHubData(arg) {
    console.log("ARG", arg);
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
function FundamentalsMarketNews(p, ref) {
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
    const startingNewsIncrementor = () => {
        if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
            return (p.widgetCopy.newsIncrementor);
        }
        else {
            return (1);
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
    const [stockData, setStockData] = useState(startingstockData());
    const [newsIncrementor, setNewsIncrementor] = useState(startingNewsIncrementor());
    const dispatch = useDispatch(); //allows widget to run redux actions.
    const rShowData = useSelector((state) => {
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false' &&
            state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData = state.showData.dataSet[p.widgetKey]['market'];
            return (showData);
        }
    });
    useImperativeHandle(ref, () => ({
        state: {
            stockData: stockData,
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
                securityList: [[`market`]]
            };
            dispatch(rBuildVisableData(payload));
        }
    }, [p.widgetKey, widgetCopy, dispatch]);
    useEffect((filters = p.filters, update = p.updateWidgetFilters, key = p.widgetKey) => {
        if (filters['startDate'] === undefined) {
            const categorySelection = 'general'; //['general', 'forex', 'crypto', 'merger']
            update(key, 'categorySelection', categorySelection);
        }
    }, [p.filters, p.updateWidgetFilters, p.widgetKey]);
    useEffect(() => {
        if (isFinnHubData(rShowData) === true) {
            setStockData(rShowData);
        }
        else {
            setStockData([]);
        }
    }, [rShowData]);
    function updateFilter(e) {
        p.updateWidgetFilters(p.widgetKey, "categorySelection", e);
    }
    function formatSourceName(source) {
        //clean up source names for news articles.
        let formattedSource = source;
        if (formattedSource !== undefined) {
            formattedSource = formattedSource.replace(".com", "");
            formattedSource = formattedSource.replace("http:", "");
            formattedSource = formattedSource.replace("https:", "");
            formattedSource = formattedSource.replace("//", "");
            formattedSource = formattedSource.replace("www.", "");
            formattedSource = formattedSource.replace("wsj", "Wall Street Journal");
            formattedSource = formattedSource.replace(formattedSource[0], formattedSource[0].toUpperCase());
        }
        return formattedSource;
    }
    function shortHeadline(headline) {
        let shortHeadLine = headline.slice(0, 48) + "...";
        return shortHeadLine;
    }
    function changeIncrememnt(e) {
        const newIncrement = newsIncrementor + e;
        if (newIncrement > 0 && newIncrement < 11)
            setNewsIncrementor(newIncrement);
    }
    function changeCategory(e) {
        const target = e.target.value;
        // this.setState({ categorySelection: target });
        updateFilter(target);
        setNewsIncrementor(1);
    }
    function newsTable() {
        let increment = 10 * newsIncrementor;
        let newStart = increment - 10;
        let newsEnd = increment;
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
    function renderStockData() {
        let newSymbolList = ['general', 'forex', 'crypto', 'merger'].map((el) => (React.createElement("option", { key: el + "ddl", value: el }, el)));
        let symbolSelectorDropDown = (React.createElement(React.Fragment, null,
            React.createElement("div", null,
                React.createElement("select", { value: p.filters.categorySelection, onChange: changeCategory }, newSymbolList),
                React.createElement("button", { onClick: () => changeIncrememnt(-1) },
                    React.createElement("i", { className: "fa fa-backward", "aria-hidden": "true" })),
                React.createElement("button", { onClick: () => changeIncrememnt(1) },
                    React.createElement("i", { className: "fa fa-forward", "aria-hidden": "true" }))),
            React.createElement("div", null, newsTable())));
        return symbolSelectorDropDown;
    }
    return (React.createElement(React.Fragment, null,
        p.showEditPane === 1 && (React.createElement(React.Fragment, null, renderSearchPane())),
        p.showEditPane === 0 && (React.createElement(React.Fragment, null, renderStockData()))));
}
export default forwardRef(FundamentalsMarketNews);
export function marketNewsProps(that, key = "newWidgetNameProps") {
    let propList = {
        apiKey: that.props.apiKey,
        // defaultExchange: that.props.defaultExchange,
        // exchangeList: that.props.exchangeList,
        filters: that.props.widgetList[key]["filters"],
        showPane: that.showPane,
        // trackedStocks: that.props.widgetList[key]["trackedStocks"],
        // updateDefaultExchange: that.props.updateDefaultExchange,
        updateWidgetFilters: that.props.updateWidgetFilters,
        // updateGlobalStockList: that.props.updateGlobalStockList,
        // updateWidgetStockList: that.props.updateWidgetStockList,
        widgetKey: key,
    };
    return propList;
}
//rename
export const marketNewsFilters = {
    categorySelection: 'general' //['general', 'forex', 'crypto', 'merger']
};
//# sourceMappingURL=marketNewsBody.js.map