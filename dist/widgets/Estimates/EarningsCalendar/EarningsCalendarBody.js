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
    if (arg !== undefined && Object.keys(arg).length > 0 && arg.earningsCalendar && arg.earningsCalendar[0] && arg.earningsCalendar[0].date) {
        // console.log("returning true", arg)
        return true;
    }
    else {
        // console.log("returning false", arg)
        return false;
    }
}
//RENAME FUNCTION
function EstimatesEarningsCalendar(p, ref) {
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
    const [widgetCopy] = useState(startingWidgetCoptyRef());
    const [stockData, setStockData] = useState(startingstockData());
    const [targetStock, setTargetStock] = useState(startingTargetStock());
    const [display, setDisplay] = useState('EPS'); //EPS or Revenue
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
            display: display,
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
            const startDate = -604800 * 1000 * 52; //1 year backward. Limited to 1 year on free version.
            const endDate = 0; //today.
            update(key, 'startDate', startDate);
            update(key, 'endDate', endDate);
            update(key, 'Description', 'Date numbers are millisecond offset from now. Used for Unix timestamp calculations.');
        }
    }, [p.filters, p.updateWidgetFilters, p.widgetKey]);
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
                React.createElement("form", { className: "form-stack" },
                    React.createElement("label", { htmlFor: "start" }, "Start date:"),
                    React.createElement("input", { className: "btn", id: "start", type: "date", name: "startDate", onChange: updateFilter, value: startDate }),
                    React.createElement("br", null),
                    React.createElement("label", { htmlFor: "end" }, "End date:"),
                    React.createElement("input", { className: "btn", id: "end", type: "date", name: "endDate", onChange: updateFilter, value: endDate }))),
            React.createElement("table", null,
                React.createElement("tbody", null, stockListRows))));
        return searchForm;
    }
    function stockTable() {
        const actual = display === 'EPS' ? 'epsActual' : 'revenueActual';
        const estimate = display === 'EPS' ? 'epsEstimate' : 'revenueEstimate';
        let sortedData = stockData['earningsCalendar'] !== undefined ? [...stockData['earningsCalendar']].sort((a, b) => (new Date(a.date) > new Date(b.date) ? 1 : -1)) : [];
        let tableData = sortedData.map((el) => {
            return React.createElement("tr", { key: "row" + el.date },
                React.createElement("td", { className: 'rightTE', key: "period" + el.date },
                    " ",
                    `${el['year']} Q:${el['quarter']}`,
                    " "),
                React.createElement("td", { className: 'rightTE', key: "estimate" + el.date }, Number(el[estimate]).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2, })),
                React.createElement("td", { className: 'rightTE', key: "actual" + el.date }, Number(el[actual]).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2, })),
                React.createElement("td", { className: 'rightTE', key: "var" + el.date }, Number(el[actual] - el[estimate]).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2, })),
                React.createElement("td", { className: 'rightTE', key: "var2" + el.date }, Number(((el[actual] - el[estimate]) / el[estimate]) * 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2, })));
        });
        return tableData;
    }
    function changeValueSelection(e) {
        const target = e.target.value;
        setDisplay(target);
    }
    function changeStockSelection(e) {
        const target = e.target.value;
        const key = `${p.widgetKey}-${target}`;
        setTargetStock(target);
        dispatch(tSearchMongoDB([key]));
    }
    function renderStockData() {
        let newSymbolList = ["EPS", "Revenue"].map((el) => (React.createElement("option", { key: el, value: el }, el)));
        let newStockList = Object.keys(p.trackedStocks).map((el) => (React.createElement("option", { key: el + "ddl", value: el }, p.trackedStocks[el].dStock(p.exchangeList))));
        if (stockData !== undefined) {
            let symbolSelectorDropDown = (React.createElement(React.Fragment, null,
                React.createElement("div", { className: "div-inline" },
                    "  Stock:  ",
                    React.createElement("select", { className: "btn", value: targetStock, onChange: changeStockSelection }, newStockList),
                    "  Display:  ",
                    React.createElement("select", { className: "btn", value: display, onChange: changeValueSelection }, newSymbolList)),
                React.createElement("table", null,
                    React.createElement("thead", null,
                        React.createElement("tr", null,
                            React.createElement("td", null, "Quarter"),
                            React.createElement("td", null, display === 'EPS' ? 'EPS Estimate' : 'Revenue Estimate'),
                            React.createElement("td", null, display === 'EPS' ? 'EPS Actual' : 'Revenue Actual'),
                            React.createElement("td", null, "Variance"),
                            React.createElement("td", null, "Variance%"))),
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
export default forwardRef(EstimatesEarningsCalendar);
export function EarningsCalendarProps(that, key = "newWidgetNameProps") {
    let propList = {
        apiKey: that.props.apiKey,
        showPane: that.showPane,
        trackedStocks: that.props.widgetList[key]["trackedStocks"],
        filters: that.props.widgetList[key]["filters"],
        updateWidgetFilters: that.props.updateWidgetFilters,
        updateGlobalStockList: that.props.updateGlobalStockList,
        updateWidgetStockList: that.props.updateWidgetStockList,
        widgetKey: key,
        exchangeList: that.props.exchangeList,
        defaultExchange: that.props.defaultExchange,
        updateDefaultExchange: that.props.updateDefaultExchange,
        targetSecurity: that.props.targetSecurity,
    };
    return propList;
}
export const EarningsCalendarFilters = {
    startDate: -604800 * 1000 * 52,
    endDate: 0,
    description: 'Date numbers are millisecond offset from now. Used for Unix timestamp calculations.',
};
//# sourceMappingURL=EarningsCalendarBody.js.map