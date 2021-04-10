import * as React from "react";
import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";
import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";
import { tSearchMongoDB } from '../../../thunks/thunkSearchMongoDB';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { rBuildVisableData } from '../../../slices/sliceShowData';
import { tGetSymbolList } from "./../../../slices/sliceExchangeData";
const useDispatch = useAppDispatch;
const useSelector = useAppSelector;
//add any additional type guard functions here used for live code.
function isFinnHubData(arg) {
    if (arg !== undefined && Object.keys(arg).length > 0) {
        // console.log("returning true", arg)
        return true;
    }
    else {
        console.log("returning false", arg);
        return false;
    }
}
//RENAME FUNCTION
function FundamentalsPeers(p, ref) {
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
    const [updateExchange, setUpdateExchange] = useState(0);
    const dispatch = useDispatch(); //allows widget to run redux actions.
    const rShowData = useSelector((state) => {
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false' &&
            state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData = state.showData.dataSet[p.widgetKey][targetStock];
            return (showData);
        }
    });
    const rExchange = useSelector((state) => {
        if (state.exchangeData.e.ex === p.defaultExchange) {
            const exchangeData = state.exchangeData.e.data;
            const widgetData = state.showData.dataSet[p.widgetKey] ? state.showData.dataSet[p.widgetKey][targetStock] : {};
            const lookupNames = {};
            for (const s in widgetData) {
                const stockKey = `${p.defaultExchange}-${widgetData[s]}`;
                const name = exchangeData && exchangeData[stockKey] ? exchangeData[stockKey].description : '';
                lookupNames[stockKey] = name;
            }
            return (lookupNames);
        }
        else if (updateExchange === 0) {
            console.log('updating exchange');
            setUpdateExchange(1);
            dispatch(tGetSymbolList({ exchange: p.defaultExchange, apiKey: p.apiKey }));
        }
    });
    useImperativeHandle(ref, () => (
    //used to copy widgets when being dragged. example: if widget body renders time series data into chart, copy chart data.
    //add additional slices of state to list if they help reduce re-render time.
    {
        state: {
            stockData: stockData,
            targetStock: targetStock, //REMOVE IF NO TARGET STOCK
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
    function getStockName(stock) {
        try {
            const stockName = rExchange !== undefined ? rExchange[stock] : '';
            return stockName;
        }
        catch {
            // console.log('cant find stock', stock)
            return " ";
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
        let stockTable = (React.createElement("table", null,
            React.createElement("tbody", null, stockListRows)));
        return stockTable;
    }
    function changeStockSelection(e) {
        const target = e.target.value;
        const key = `${p.widgetKey}-${target}`;
        setTargetStock(target);
        dispatch(tSearchMongoDB([key]));
    }
    function renderStockData() {
        const stockDataRows = stockData.map((el) => React.createElement("tr", { key: el + "row" },
            React.createElement("td", { key: el + "symbol" }, el),
            React.createElement("td", { key: el + "name" }, getStockName(`${p.defaultExchange}-${el}`))));
        const newSymbolList = Object.keys(p.trackedStocks).map((el) => (React.createElement("option", { key: el + "ddl", value: el }, p.trackedStocks[el].dStock(p.exchangeList))));
        return React.createElement(React.Fragment, null,
            React.createElement("select", { className: "btn", value: targetStock, onChange: changeStockSelection }, newSymbolList),
            React.createElement("table", null,
                React.createElement("thead", null,
                    React.createElement("tr", null,
                        React.createElement("td", null, "Symbol"),
                        React.createElement("td", null, "Description"))),
                React.createElement("tbody", null, stockDataRows)));
    }
    return (React.createElement(React.Fragment, null,
        p.showEditPane === 1 && (React.createElement(React.Fragment, null,
            React.createElement(StockSearchPane, searchPaneProps(p)),
            renderSearchPane())),
        p.showEditPane === 0 && (React.createElement(React.Fragment, null, renderStockData()))));
}
export default forwardRef(FundamentalsPeers);
export function peersProps(that, key = "newWidgetNameProps") {
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
    };
    return propList;
}
//# sourceMappingURL=peersBody.js.map