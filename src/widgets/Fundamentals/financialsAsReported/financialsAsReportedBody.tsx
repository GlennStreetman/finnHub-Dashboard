import * as React from "react"
import { useState, useEffect, forwardRef, useRef, useMemo } from "react";
import { convertCamelToProper } from './../../../appFunctions/stringFunctions'


import { useAppDispatch, useAppSelector } from '../../../hooks';
import { tSearchMongoDB } from '../../../thunks/thunkSearchMongoDB'

import { useDragCopy } from './../../widgetHooks/useDragCopy'

import { useSearchMongoDb } from './../../widgetHooks/useSearchMongoDB'
import { useBuildVisableData } from './../../widgetHooks/useBuildVisableData'
import { useUpdateFocus } from './../../widgetHooks/useUpdateFocus'

import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";

import { dStock } from './../../../appFunctions/formatStockSymbols'

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
    useUpdateFocus(p.targetSecurity, p.updateWidgetConfig, p.widgetKey) //sets security focus in config. Used for redux.visable data and widget excel templating.	
    useSearchMongoDb(p.config.targetSecurity, p.widgetKey, widgetCopy, dispatch, isInitialMount) //on change to target security retrieve fresh data from mongoDB
    useBuildVisableData(focusSecurityList, p.widgetKey, widgetCopy, dispatch, isInitialMount) //rebuild visable data on update to target security

    useEffect((
        key: number = p.widgetKey,
        trackedStock = p.trackedStocks,
        keyList: string[] = Object.keys(p.trackedStocks),
        updateWidgetConfig: Function = p.updateWidgetConfig) => {
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

    useEffect((
        key: number = p.widgetKey,
        trackedStock = p.trackedStocks,
        keyList: string[] = Object.keys(p.trackedStocks),
        updateWidgetConfig: Function = p.updateWidgetConfig) => {
        //Setup default metric source if none selected.
        if (p.config.targetSecurity !== undefined && !p.config.year && rShowData?.[0]?.['year']) {
            const newYear = rShowData?.[0]?.['year']
            updateWidgetConfig(key, {
                ...p.config, ...{ year: newYear }
            })
        }
    }, [p.updateWidgetConfig, rShowData, p.widgetKey, p.trackedStocks, p.apiKey, p.config.targetSecurity, p.config])

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
                    <td className="centerTE" key={el + "buttonC"}>
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
                    <td className='centerTE' key={el + "name"}>{dStock(p.trackedStocks[el], p.exchangeList)}</td>
                    <td className='leftTE'>{p.trackedStocks[el].description}</td>

                </tr>
            ) : (
                <tr key={el + "pass"}></tr>
            )
        );
        let stockListTable = (
            <div className='scrollableDiv'>
                <table className='dataTable'>
                    <thead>
                        <tr>
                            <td>Remove</td>
                            <td>Symbol</td>
                            <td>Name</td>
                        </tr>
                    </thead>
                    <tbody>{row}</tbody>
                </table>
            </div>
        );
        return <>{stockListTable}</>;
    }

    function changeStockSelection(e) { //DELETE IF no target stock
        const target = e.target.value;
        p.updateWidgetConfig(p.widgetKey, {
            ...p.config, ...{ targetSecurity: target, }
        })
    }

    function changeReportSelection(e) {
        const target = e.target.value;
        const key = `${p.widgetKey}-${p?.config?.targetSecurity}`
        p.updateWidgetConfig(p.widgetKey, {
            ...p.config, ...{ targetReport: target, }
        })
        dispatch(tSearchMongoDB([key]))
    }

    function changeIncrememnt(e) {
        const newPagination = p.config.pagination + e;
        if (newPagination > -1 && rShowData && newPagination <= Object.keys(rShowData).length - 1) {
            p.updateWidgetConfig(p.widgetKey, {
                ...p.config,
                ...{ pagination: newPagination, year: rShowData[newPagination]['year'] }
            })
        }
    }

    function renderStockData() {
        const newSymbolList = Object.keys(p.trackedStocks).map((el) => (
            <option key={el + "ddl"} value={el}>
                {dStock(p.trackedStocks[el], p.exchangeList)}
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
                        <td className='rightTE'>{convertCamelToProper(el[0])}: &nbsp;&nbsp;</td>
                        <td>{val}</td>
                    </tr>
                )
            } else { return <tr key={el[0]}></tr> }
        }) : <></>

        const stockTable =
            <>
                <select data-testid='financialsAsReportedStock' className="btn" value={p.config.targetSecurity} onChange={changeStockSelection}>
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
                <div className='scrollableDiv'>
                    <table className='dataTable'>
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
                </div>
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
        targetSecurity: that.props.targetSecurity,
        trackedStocks: that.props.widgetList[key]["trackedStocks"],
        updateWidgetStockList: that.props.updateWidgetStockList,
        updateWidgetConfig: that.props.updateWidgetConfig,
        widgetKey: key,
        widgetHeader: that.props.widgetList[key].widgetHeader
    };
    return propList;
}


