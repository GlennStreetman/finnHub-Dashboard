import * as React from "react"
import { useState, forwardRef, useRef } from "react";

import { useAppDispatch, useAppSelector } from '../../../hooks';

import { convertCamelToProper } from '../../../appFunctions/stringFunctions'

import { useTargetSecurity } from '../../widgetHooks/useTargetSecurity'
import { useSearchMongoDb } from '../../widgetHooks/useSearchMongoDB'
import { useBuildVisableData } from '../../widgetHooks/useBuildVisableData'
import { useUpdateFocus } from '../../widgetHooks/useUpdateFocus'

import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";

const useDispatch = useAppDispatch
const useSelector = useAppSelector

function PriceTargetBody(p: { [key: string]: any }, ref: any) {
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
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false' &&
            state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData: object = state.showData.dataSet[p.widgetKey][p.config.targetSecurity]
            return (showData)
        }
    })

    useTargetSecurity(p.widgetKey, p.trackedStocks, p.updateWidgetConfig, p?.config?.targetSecurity,) //sets target security for widget on mount and change to security focus from watchlist.
    useSearchMongoDb(p.config.targetSecurity, p.widgetKey, dispatch) //on change to target security retrieve fresh data from mongoDB
    useBuildVisableData(p?.config?.targetSecurity, p.widgetKey, widgetCopy, dispatch, isInitialMount) //rebuild visable data on update to target security
    useUpdateFocus(p.targetSecurity, p.updateWidgetConfig, p.widgetKey) //on update to security focus, from watchlist menu, update target security.

    function changeStockSelection(e) { //DELETE IF no target stock
        const target = e.target.value;
        p.updateWidgetConfig(p.widgetKey, {
            targetSecurity: target,
        })
    }

    function renderSearchPane() {
        const stockList = Object.keys(p.trackedStocks);
        const stockListRows = stockList.map((el) =>
            <tr key={el + "container"}>
                <td key={el + "name"}>{p.trackedStocks[el].dStock(p.exchangeList)}</td>
                <td key={el + "buttonC"}>
                    <button data-testid={`remove-${el}`}
                        key={el + "button"}
                        onClick={() => {
                            p.updateWidgetStockList(p.widgetKey, el);
                        }}
                    >
                        <i className="fa fa-times" aria-hidden="true" key={el + "icon"}></i>
                    </button>
                </td>
            </tr>
        )

        let stockTable = (
            <table data-testid='priceTargetSearchPane'>
                <tbody>{stockListRows}</tbody>
            </table>
        );
        return stockTable
    }

    function renderStockData() {
        const parseList = ['targetHigh', 'targetLow', 'targetMean', 'targetMedian']

        const stockDataRows = rShowData ? Object.keys(rShowData).map((el) =>
            <tr key={el + "row"}>
                <td key={el + "symbol"}>{convertCamelToProper(el)}</td>
                <td key={el + "name"}>{parseList.includes(el) ? parseInt(rShowData[el]).toFixed(2) : rShowData[el]}</td>
            </tr>
        ) : <></>
        const newSymbolList = Object.keys(p.trackedStocks).map((el) => (
            <option key={el + "ddl"} value={el}>
                {p.trackedStocks[el].dStock(p.exchangeList)}
            </option>
        ))
        return <>
            <select data-testid='ptSelectStock' className="btn" value={p.config.targetSecurity} onChange={changeStockSelection}>
                {newSymbolList}
            </select>
            <table>
                <tbody data-testid='ptRow'>
                    {stockDataRows}
                </tbody>
            </table>
        </>
    }

    return (
        <div data-testid='priceTargetBody' >
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

export default forwardRef(PriceTargetBody)

export function priceTargetProps(that, key = "newWidgetNameProps") {
    let propList = {
        apiKey: that.props.apiKey,
        defaultExchange: that.props.defaultExchange,
        exchangeList: that.props.exchangeList,
        filters: that.props.widgetList[key]["filters"],
        showPane: that.showPane,
        trackedStocks: that.props.widgetList[key]["trackedStocks"],
        updateDefaultExchange: that.props.updateDefaultExchange,
        updateGlobalStockList: that.props.updateGlobalStockList,
        updateWidgetStockList: that.props.updateWidgetStockList,
        updateWidgetConfig: that.props.updateWidgetConfig,
        widgetKey: key,
        targetSecurity: that.props.targetSecurity,
    };
    return propList;
}


