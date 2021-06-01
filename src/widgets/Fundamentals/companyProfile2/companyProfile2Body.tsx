import * as React from "react"
import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";

import { useAppDispatch, useAppSelector } from '../../../hooks';
import { rBuildVisableData } from '../../../slices/sliceShowData'
import { tSearchMongoDB } from '../../../thunks/thunkSearchMongoDB'

import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";
import { convertCamelToProper } from '../../../appFunctions/stringFunctions'

const useDispatch = useAppDispatch
const useSelector = useAppSelector

interface FinnHubAPIData { //rename
    country: string,
    currency: string,
    exchange: string,
    iop: string,
    marketCapitalization: number,
    name: string,
    phone: string,
    shareOutstanding: number,
    ticker: string,
    weburl: string,
    logo: string,
    finnHubIndustry: string,
}

interface FinnHubAPIDataArray {
    [index: number]: FinnHubAPIData
}

//add any additional type guard functions here used for live code.
function isFinnHubData(arg: any): arg is FinnHubAPIDataArray { //typeguard
    if (arg !== undefined && Object.keys(arg).length > 0 && arg.country) {
        return true
    } else {
        return false
    }
}

function FundamentalsCompanyProfile2(p: { [key: string]: any }, ref: any) {
    const isInitialMount = useRef(true); //update to false after first render.

    const startingstockData = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
                const stockData = JSON.parse(JSON.stringify(p.widgetCopy.stockData))
                return (stockData)
            } else {
                return ([])
            }
        }
    }

    const startingTargetStock = () => { //REMOVE IF TARGET STOCK NOT NEEDED.
        if (isInitialMount.current === true) {
            if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
                const targetStock = p.widgetCopy.targetStock
                return (targetStock)
            } else { return ('') }
        }
    }

    const startingWidgetCoptyRef = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy !== undefined && p.widgetCopy.widgetID !== null) {
                return p.widgetCopy.widgetID
            } else { return -1 }
        }
    }

    const [widgetCopy] = useState(startingWidgetCoptyRef())
    const [stockData, setStockData] = useState(startingstockData());
    const [targetStock, setTargetStock] = useState(startingTargetStock());
    const dispatch = useDispatch(); //allows widget to run redux actions.

    const rShowData = useSelector((state) => { //REDUX Data associated with this widget.
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false' &&
            state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData: object = state.showData.dataSet[p.widgetKey][targetStock]
            return (showData)
        }
    })

    useImperativeHandle(ref, () => (
        //used to copy widgets when being dragged. example: if widget body renders time series data into chart, copy chart data.
        //add additional slices of state to list if they help reduce re-render time.
        {
            state: {
                stockData: stockData,
                targetStock: targetStock, //REMOVE IF NO TARGET STOCK
            },
        }
    ))

    useEffect(() => {
        //On mount, use widget copy, else build visable data.
        //On update, if change in target stock, rebuild visable data.
        if (isInitialMount.current === true && widgetCopy === p.widgetKey) {
            isInitialMount.current = false;
        } else {
            if (isInitialMount.current === true) { isInitialMount.current = false }
            const payload: object = {
                key: p.widgetKey,
                securityList: [[`${targetStock}`]]
            }
            dispatch(rBuildVisableData(payload))
        }
    }, [targetStock, p.widgetKey, widgetCopy, dispatch])

    useEffect(() => {
        //DELETE IF NO TARGET STOCK
        //if stock not selected default to first stock.
        if (Object.keys(p.trackedStocks).length > 0 && targetStock === '') {
            const setDefault = p.trackedStocks[Object.keys(p.trackedStocks)[0]].key
            setTargetStock(setDefault)
        }
    }, [p.trackedStocks, targetStock])

    useEffect(() => { //on update to redux data, update widget stock data, as long as data passes typeguard.
        if (isFinnHubData(rShowData) === true) { setStockData(rShowData) } else { setStockData([]) }
    }, [rShowData])

    useEffect(() => { //on change to targetSecurity update widget focus
        if (p.targetSecurity !== '') {
            const target = `${p.widgetKey}-${p.targetSecurity}`
            setTargetStock(p.targetSecurity)
            dispatch(tSearchMongoDB([target]))
        }
    }, [p.targetSecurity, p.widgetKey, dispatch])

    function editWidgetStockList(stock) {
        if (stock.indexOf(":") > 0) {
            const stockSymbole = stock.slice(0, stock.indexOf(":"));
            p.updateWidgetStockList(p.widgetKey, stockSymbole);
        } else {
            p.updateWidgetStockList(p.widgetKey, stock);
        }
    }

    function stockListForm() {
        const stockList = Object.keys(p.trackedStocks);
        let row = stockList.map((el) =>
            p.showEditPane === 1 ? (
                <tr key={el + "container"}>
                    <td key={el + "name"}>{p.trackedStocks[el].dStock(p.exchangeList)}</td>
                    <td key={el + "buttonC"}>
                        <button
                            data-testid={`remove-${el}`}
                            key={el + "button"}
                            onClick={() => {
                                editWidgetStockList(el);
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
        let stockListTable = (
            <table>
                <tbody>{row}</tbody>
            </table>
        );
        return stockListTable;
    }

    function mapStockData() {
        const rows = Object.keys(stockData).map((key) =>
            <tr key={stockData[key + 'tr'] + key}>
                <td key={stockData[key + 'td']}>{`${convertCamelToProper(key)}: `}</td>
                <td key={stockData[key + 'td2'] + key}>
                    {key === 'logo' ? <img key={stockData[key + 'pic'] + key} width='25%' src={stockData[key]} alt={stockData[key]}></img> : stockData[key]}
                </td>
            </tr>
        )
        return rows
    }

    function renderSearchPane() {
        return <>
            {stockListForm()}
        </>
    }

    function changeStockSelection(e) { //DELETE IF no target stock
        const target = e.target.value;
        const key = `${p.widgetKey}-${target}`
        setTargetStock(target)
        dispatch(tSearchMongoDB([key]))
    }

    function renderStockData() {
        const newSymbolList = Object.keys(p.trackedStocks).map((el) => (
            <option key={el + "ddl"} value={el}>
                {p.trackedStocks[el].dStock(p.exchangeList)}
            </option>
        ))


        const stockTable =
            <>
                <select data-testid='profile2DropDown' className="btn" value={targetStock} onChange={changeStockSelection}>
                    {newSymbolList}
                </select>
                <br />
                <table>
                    <thead>
                        <tr>
                            <td>Key</td>
                            <td>Value</td>
                        </tr>
                    </thead>
                    <tbody>
                        {mapStockData()}
                    </tbody>
                </table>
            </>
        return stockTable
    }

    return (
        <div data-testid='companyProfile2Body'>
            {p.showEditPane === 1 && (
                <>
                    {React.createElement(StockSearchPane, searchPaneProps(p))}
                    {renderSearchPane()}
                </>
            )}
            {p.showEditPane === 0 && (
                <>
                    {renderStockData()}
                </>
            )}
        </div>
    )
}

export default forwardRef(FundamentalsCompanyProfile2)

export function companyProfile2Props(that, key = "newWidgetNameProps") {
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


