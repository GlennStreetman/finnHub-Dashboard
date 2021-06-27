import * as React from "react"
import { useState, useEffect, forwardRef, useRef, useMemo } from "react";
import { convertCamelToProper } from './../../../appFunctions/stringFunctions'


import { useAppDispatch, useAppSelector } from '../../../hooks';
import { tSearchMongoDB } from '../../../thunks/thunkSearchMongoDB'

import { useDragCopy } from './../../widgetHooks/useDragCopy'
import { useTargetSecurity } from './../../widgetHooks/useTargetSecurity'
import { useSearchMongoDb } from './../../widgetHooks/useSearchMongoDB'
import { useBuildVisableData } from './../../widgetHooks/useBuildVisableData'



import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";

const useDispatch = useAppDispatch
const useSelector = useAppSelector

interface finnHubFilingObj {
    accessNumber: string,
    symbol: string,
    cik: string,
    year: number,
    quarter: number,
    form: string,
    startDate: string,
    endDate: string,
    fileDate: string,
    acceptDate: string,
    report: Object,
}

export interface FinnHubAPIData {
    filters: object,
    symbol: string,
    cik: string,
    data: finnHubFilingObj,
}


function FundamentalsFinancialsAsReported(p: { [key: string]: any }, ref: any) {
    const isInitialMount = useRef(true); //update to false after first render.

    const startingWidgetCoptyRef = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy !== undefined && p.widgetCopy.widgetID !== null) {
                return p.widgetCopy.widgetID
            } else { return -1 }
        }
    }

    const [widgetCopy] = useState(startingWidgetCoptyRef())
    const dispatch = useDispatch(); //allows widget to run redux actions.

    const rShowData = useSelector((state) => { //REDUX Data associated with this widget.
        if (state?.dataModel.created !== undefined &&
            state.dataModel.created !== 'false' &&
            state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData: object = state?.showData?.dataSet?.[p.widgetKey]?.[p.config.targetSecurity]?.['data']
            return (showData)
        }
    })

    const focusSecurityList = useMemo(() => { //remove if all securities should stay in focus.
        return [p?.config?.targetSecurity]
    }, [p?.config?.targetSecurity])

    useDragCopy(ref, {})//useImperativeHandle. Saves state on drag. Dragging widget pops widget out of component array causing re-render as new component.
    useTargetSecurity(p.widgetKey, p.trackedStocks, p.updateWidgetConfig, p?.config?.targetSecurity,) //sets target security for widget on mount and change to security focus from watchlist.
    useSearchMongoDb(p.config.targetSecurity, p.widgetKey, dispatch) //on change to target security retrieve fresh data from mongoDB
    useBuildVisableData(focusSecurityList, p.widgetKey, widgetCopy, dispatch, isInitialMount) //rebuild visable data on update to target security

    useEffect((key: number = p.widgetKey, trackedStock = p.trackedStocks, keyList: string[] = Object.keys(p.trackedStocks), updateWidgetConfig: Function = p.updateWidgetConfig) => {
        //Setup default metric source if none selected.
        if (p.config.targetSecurity === undefined) {
            const newSource: string = keyList.length > 0 ? trackedStock[keyList[0]].key : ''
            updateWidgetConfig(key, {
                targetSecurity: newSource,
                targetReport: 'bs',
                pagination: 0,
                year: rShowData ? rShowData[0]['year'] : ''
            })
        }
    }, [p.updateWidgetConfig, rShowData, p.widgetKey, p.trackedStocks, p.apiKey, p.config.targetSecurity])

    function updateWidgetList(stock) {
        if (stock.indexOf(":") > 0) {
            const stockSymbol = stock.slice(0, stock.indexOf(":"));
            p.updateWidgetStockList(p.widgetKey, stockSymbol);
        } else {
            p.updateWidgetStockList(p.widgetKey, stock);
        }
    }

    function renderSearchPane() {
        //add search pane rendering logic here. Additional filters need to be added below.
        const stockList = Object.keys(p.trackedStocks);
        const row = stockList.map((el) =>
            p.showEditPane === 1 ? (
                <tr key={el + "container"}>
                    <td key={el + "name"}>{p.trackedStocks[el].dStock(p.exchangeList)}</td>
                    <td key={el + "buttonC"}>
                        <button
                            data-testid={`remove-${el}`}
                            key={el + "button"}
                            onClick={() => {
                                updateWidgetList(el);
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
        return <>{stockListTable}</>;
    }

    function changeStockSelection(e) { //DELETE IF no target stock
        const target = e.target.value;
        p.updateWidgetConfig(p.widgetKey, {
            targetSecurity: target,
        })
    }

    function changeReportSelection(e) {
        const target = e.target.value;
        const key = `${p.widgetKey}-${p?.config?.targetSecurity}`
        p.updateWidgetConfig(p.widgetKey, {
            targetReport: target,
        })
        dispatch(tSearchMongoDB([key]))
    }

    function changeIncrememnt(e) {
        const newPagination = p.config.pagination + e;
        if (newPagination > -1 && rShowData && newPagination <= Object.keys(rShowData).length - 1) {
            p.updateWidgetConfig(p.widgetKey, {
                pagination: newPagination,
                year: rShowData[newPagination]['year']
            })
        }
    }

    function renderStockData() {
        const newSymbolList = Object.keys(p.trackedStocks).map((el) => (
            <option key={el + "ddl"} value={el}>
                {p.trackedStocks[el].dStock(p.exchangeList)}
            </option>
        ))

        const reportSelection =
            <>
                <option key='bs' value='bs'> Balance Sheet</option>
                <option key='ic' value='ic' > Income Statement </option>
                <option key='cf' value='cf' > Cash Flow </option>
            </>

        const stockDataNode = rShowData ? rShowData[p.config.pagination] : []
        const mapstockDataNode = stockDataNode ? Object.entries(stockDataNode).map((el) => {
            if (el[0] !== 'report') {
                const val: any = typeof el[1] !== 'object' ? el[1] : <></>
                return (
                    <tr key={el[0] + p.config.pagination}>
                        <td>{convertCamelToProper(el[0])}</td>
                        <td>{val}</td>
                    </tr>
                )
            } else { return <tr key={el[0]}></tr> }
        }) : <></>

        const stockTable =
            <>
                <select data-testid='financialsAsReportedStock' className="btn" value={p.configtargetSecurity} onChange={changeStockSelection}>
                    {newSymbolList}
                </select>
                <select data-testid='financialsAsReportedSelection' className="btn" value={p.config.targetReport} onChange={changeReportSelection}>
                    {reportSelection}
                </select>
                <button onClick={() => changeIncrememnt(-1)}>
                    <i className="fa fa-backward" aria-hidden="true"></i>
                </button>
                <button onClick={() => changeIncrememnt(1)}>
                    <i className="fa fa-forward" aria-hidden="true"></i>
                </button>
                <table>
                    <thead>
                        <tr>
                            <td>Heading</td>
                            <td>Value</td>
                        </tr>
                    </thead>
                    <tbody>
                        {mapstockDataNode}
                    </tbody>
                </table>
            </>
        return stockTable
    }


    return (
        <div data-testid='financialsAsReportedBody'>
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

export default forwardRef(FundamentalsFinancialsAsReported)

export function financialsAsReportedProps(that, key = "newWidgetNameProps") {
    let propList = {
        apiKey: that.props.apiKey,
        currentDashBoard: that.props.currentDashBoard,
        defaultExchange: that.props.defaultExchange,
        exchangeList: that.props.exchangeList,
        filters: that.props.widgetList[key]["filters"],
        showPane: that.showPane,
        targetSecurity: that.props.targetSecurity,
        trackedStocks: that.props.widgetList[key]["trackedStocks"],
        updateDefaultExchange: that.props.updateDefaultExchange,
        updateGlobalStockList: that.props.updateGlobalStockList,
        updateWidgetStockList: that.props.updateWidgetStockList,
        updateWidgetConfig: that.props.updateWidgetConfig,
        widgetKey: key,
        widgetHeader: that.props.widgetList[key].widgetHeader
    };
    return propList;
}


