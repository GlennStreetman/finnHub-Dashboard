import React from "react";
import { useState, useEffect, useMemo, forwardRef, useRef } from "react";


import { useAppDispatch, useAppSelector } from '../../../hooks';

import { useDragCopy } from './../../widgetHooks/useDragCopy'
import { useSearchMongoDb } from './../../widgetHooks/useSearchMongoDB'
import { useBuildVisableData } from './../../widgetHooks/useBuildVisableData'
import { useUpdateFocus } from './../../widgetHooks/useUpdateFocus'

import WidgetRemoveSecurityTable from '../../../components/widgetRemoveSecurityTable'
import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";
import { dStock } from './../../../appFunctions/formatStockSymbols'
import { UpdateWidgetStockList } from 'src/appFunctions/appImport/widgetLogic'
import { rSetDashboardData } from 'src/slices/sliceDashboardData'
import { rBuildDataModel } from 'src/slices/sliceDataModel'

const useDispatch = useAppDispatch
const useSelector = useAppSelector

interface FinnHubQuoteDataFormated {
    currentPrice: number,
    dayHighPrice: number,
    dayLowPrice: number,
    dayOpenPrice: number,
    prevClosePrice: number,
}

interface FinnHubQuoteDataRaw {
    c: number,
    h: number,
    l: number,
    o: number,
    pc: number,
    t: number,
}

export interface FinnHubQuoteObj {
    [key: string]: FinnHubQuoteDataFormated
}

function isQuoteData(arg: any): arg is FinnHubQuoteDataRaw { //defined shape of finnHub data for this widget. CHeck used before rendering.
    return arg.c !== undefined
}

function PriceQuote(p: { [key: string]: any }, ref: any) {
    const isInitialMount = useRef(true);

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

    const startingWidgetCopyRef = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy !== undefined && p.widgetCopy.widgetID !== null) {
                return p.widgetCopy.widgetID
            } else { return -1 }
        }
    }

    const [stockData, setStockData] = useState(startingstockData())
    const [widgetCopy] = useState(startingWidgetCopyRef())

    const dispatch = useDispatch()

    const rShowData = useSelector((state) => {//redux connection
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false' &&
            state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData = state.showData.dataSet[p.widgetKey]
            return (showData)
        }
    })

    const rStreamData = useSelector((state) => { //REDUX Data associated with this widget.
        return state.quotePrice.quote
    })

    const focusSecurityList = useMemo(() => { //remove if all securities should stay in focus.
        return Object.keys(p.trackedStocks)
    }, [p.trackedStocks])


    useDragCopy(ref, { stockData: stockData, })//useImperativeHandle. Saves state on drag. Dragging widget pops widget out of component array causing re-render as new component.
    useSearchMongoDb(p.currentDashBoard, p.finnHubQueue, p.config.targetSecurity, p.widgetKey, widgetCopy, dispatch, isInitialMount, p.dashboardID) //on change to target security retrieve fresh data from mongoDB
    useBuildVisableData(focusSecurityList, p.widgetKey, widgetCopy, dispatch, isInitialMount) //rebuild visable data on update to target security
    useUpdateFocus(p.targetSecurity, p.widgetKey, p.config, p.dashBoardData, p.currentDashBoard, p.enableDrag, dispatch) //sets security focus in config. Used for redux.visable data and widget excel templating.

    useEffect(() => { //CREATE STOCK DATA

        if (rShowData !== undefined && Object.keys(rShowData).length > 0) {
            const newData: FinnHubQuoteObj = {}
            for (const key in rShowData) {
                const data: any = rShowData[key]
                if (isQuoteData(data)) {
                    newData[key] = {
                        currentPrice: data.c,
                        dayHighPrice: data.h,
                        dayLowPrice: data.l,
                        dayOpenPrice: data.o,
                        prevClosePrice: data.pc,
                    }
                }
            }
            setStockData(newData)
        } else { setStockData({}) }
    }, [rShowData])

    function returnKey(ref) {
        const retVal = ref !== undefined ? ref["currentPrice"] : "noDat"
        return retVal
    }

    function findPrice(stock) {
        if (rStreamData[stock] !== undefined) {
            const sPrice: number = rStreamData[stock]
            const dayPrice: number = stockData[stock] ? stockData[stock] : 0
            const price: number = isNaN(sPrice) === false ? sPrice : dayPrice
            return price
        } else {
            const dayPrice: number = stockData[stock] ? stockData[stock].currentPrice : 0
            return dayPrice
        }
    }

    function renderSearchPane() {

        let searchForm = (
            <WidgetRemoveSecurityTable
                trackedStocks={p.trackedStocks}
                widgetKey={p.widgetKey}
                exchangeList={p.exchangeList}
                dashBoardData={p.dashBoardData}
                currentDashboard={p.currentDashboard}
                apiKey={p.apiKey}
            />
        );
        return searchForm
    }

    function renderStockData() {
        let pd = stockData;
        let widgetStockList = Object.keys(p.trackedStocks)
        let stockDetailRow = widgetStockList.map((el) =>
            pd[el] ? (
                <tr key={el + "st" + + pd[el]["currentPrice"]}>
                    <td className='rightTE' key={el + "id"}>{dStock(p.trackedStocks[el], p.exchangeList)}: </td>
                    <td className="rightTE" key={el + "prevClosePrice"}>
                        {pd[el]["prevClosePrice"].toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                    </td>
                    <td className="rightTE" key={el + "dayOpenPrice"}>
                        {pd[el]["dayOpenPrice"].toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                    </td>
                    <td className="rightTE" key={el + "dayLowPrice"}>
                        {pd[el]["dayLowPrice"].toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                    </td>
                    <td className="rightTE" key={el + "dayHighPrice"}>
                        {pd[el]["dayHighPrice"].toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                    </td>

                    <td className='rightTEFade' key={el + "currentPrice" + returnKey(rStreamData[el])}>
                        {findPrice(el).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                    </td>

                    {p.showEditPane === 1 ? (
                        <td className="rightTE" key={el + "buttonBox"}>
                            <button
                                key={el + "button"}
                                onClick={() => {
                                    const update = UpdateWidgetStockList(p.widgetKey, el, p.dashBoardData, p.currentDashBoard);
                                    dispatch(rSetDashboardData(update))
                                    const payload = {
                                        apiKey: p.apiKey,
                                        dashBoardData: update
                                    }
                                    dispatch(rBuildDataModel(payload))

                                }}
                            >
                                <i className="fa fa-times" aria-hidden="true"></i>
                            </button>
                        </td>
                    ) : (
                        <></>
                    )}
                </tr>
            ) : (
                <tr key={el + ""}></tr>
            )
        );
        let buildTable = (
            <div className='scrollableDiv'>
                <table className="dataTable" key={p.widgetKey + "id"}>
                    <thead key={p.widgetKey + "head"}>
                        <tr key={p.widgetKey + "tr"}>
                            <td key={p.widgetKey + "stock"}>Symbole</td>
                            <td className="centerTE" key={p.widgetKey + "close"}>
                                Prev<br /> Close
                            </td>
                            <td className="centerTE" key={p.widgetKey + "open"}>
                                Day<br /> Open
                            </td>
                            <td className="centerTE" key={p.widgetKey + "low"}>
                                Day<br /> Low
                            </td>
                            <td className="centerTE" key={p.widgetKey + "high"}>
                                Day<br /> High
                            </td>
                            <td className="centerTE" key={p.widgetKey + "price"}>
                                Price
                            </td>
                            {p.showEditPane === 1 ? <td key={p.widgetKey + "remove"}>Remove</td> : <></>}
                        </tr>
                    </thead>
                    <tbody key={p.widgetKey + "body"}>{stockDetailRow}</tbody>
                </table>
            </div>
        );
        return buildTable;
    }


    return (
        <div data-testid='quoteBody'>
            {p.showEditPane === 1 && (
                <div >
                    {React.createElement(StockSearchPane, searchPaneProps(p))}
                    {renderSearchPane()}
                </div>
            )}
            {p.showEditPane === 0 && (
                <>
                    {renderStockData()}
                </>
            )}
        </div>
    );
}

export default forwardRef(PriceQuote)

export function quoteBodyProps(that, key = "Quote") {
    let propList = {
        apiKey: that.props.apiKey,
        trackedStocks: that.props.widgetList[key]["trackedStocks"],
        widgetKey: key,
        exchangeList: that.props.exchangeList,
        defaultExchange: that.props.defaultExchange,
        dashBoardData: that.props.dashBoardData,
        currentDashBoard: that.props.currentDashBoard,
    };
    return propList;
}

