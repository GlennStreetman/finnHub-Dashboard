import * as React from "react"
import { useState, forwardRef, useRef, useMemo } from "react";
import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { RootState } from '../../../store'
import { tGetSymbolList } from "./../../../slices/sliceExchangeData";

import { useDragCopy } from './../../widgetHooks/useDragCopy'

import { useSearchMongoDb } from './../../widgetHooks/useSearchMongoDB'
import { useBuildVisableData } from './../../widgetHooks/useBuildVisableData'
import { useUpdateFocus } from './../../widgetHooks/useUpdateFocus'

import { dStock } from './../../../appFunctions/formatStockSymbols'


const useDispatch = useAppDispatch
const useSelector = useAppSelector

export interface FinnHubAPIData {
    [key: number]: string
}

function FundamentalsPeers(p: { [key: string]: any }, ref: any) {
    const isInitialMount = useRef(true); //update to false after first render.

    const startingWidgetCoptyRef = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy !== undefined && p.widgetCopy.widgetID !== null) {
                return p.widgetCopy.widgetID
            } else { return -1 }
        }
    }

    const [widgetCopy] = useState(startingWidgetCoptyRef())
    const [updateExchange, setUpdateExchange] = useState(0)
    const dispatch = useDispatch(); //allows widget to run redux actions.

    const rShowData = useSelector((state: RootState) => { //REDUX Data associated with this widget.
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false' &&
            state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData: any = state?.showData?.dataSet?.[p.widgetKey]?.[p.config.targetSecurity]
            return (showData)
        }
    })

    const rExchange = useSelector((state: any) => {
        if (state.exchangeData.e.ex === p.defaultExchange) {
            const exchangeData: any = state.exchangeData.e.data
            const widgetData = state.showData.dataSet[p.widgetKey] ? state?.showData?.dataSet?.[p.widgetKey]?.[p.config.targetSecurity] : {}
            const lookupNames: Object = {}
            for (const s in widgetData) {
                const stockKey = `${p.defaultExchange}-${widgetData[s]}`
                const name = exchangeData && exchangeData[stockKey] ? exchangeData[stockKey].description : ''
                lookupNames[stockKey] = name
            }
            return (lookupNames)
        } else if (updateExchange === 0) {
            // console.log('updating exchange')
            setUpdateExchange(1)
            dispatch(tGetSymbolList({ exchange: p.defaultExchange, apiKey: p.apiKey, finnHubQueue: p.finnHubQueue }))
        }
    })

    const focusSecurityList = useMemo(() => { //remove if all securities should stay in focus.
        return [p?.config?.targetSecurity]
    }, [p?.config?.targetSecurity])

    useDragCopy(ref, {})//useImperativeHandle. Saves state on drag. Dragging widget pops widget out of component array causing re-render as new component.
    useUpdateFocus(p.targetSecurity, p.updateWidgetConfig, p.widgetKey, p.config.targetSecurity) //sets security focus in config. Used for redux.visable data and widget excel templating.
    useSearchMongoDb(p.config.targetSecurity, p.widgetKey, widgetCopy, dispatch, isInitialMount) //on change to target security retrieve fresh data from mongoDB
    useBuildVisableData(focusSecurityList, p.widgetKey, widgetCopy, dispatch, isInitialMount) //rebuild visable data on update to target security

    function getStockName(stock) {
        try {
            const stockName = rExchange !== undefined ? rExchange[stock] : ''
            return stockName
        } catch {
            return " "
        }
    }

    function renderSearchPane() {
        const stockList = Object.keys(p.trackedStocks);
        const stockListRows = stockList.map((el) =>
            <tr key={el + "container"}>
                <td className="centerTE" key={el + "buttonC"}>
                    <button
                        data-testid={`remove-${el}`}
                        key={el + "button"}
                        onClick={() => {
                            p.updateWidgetStockList(p.widgetKey, el);
                        }}
                    >
                        <i className="fa fa-times" aria-hidden="true" key={el + "icon"}></i>
                    </button>
                </td>
                <td className='centerTE' key={el + "name"}>{dStock(p.trackedStocks[el], p.exchangeList)}</td>
                <td className='leftTE'>{p.trackedStocks[el].description}</td>
            </tr>
        )

        let stockTable = (
            <div className='scrollableDiv'>
                <table className='dataTable'>
                    <thead>
                        <tr>
                            <td>Remove</td>
                            <td>Symbol</td>
                            <td>Name</td>
                        </tr>
                    </thead>
                    <tbody>{stockListRows}</tbody>
                </table>
            </div>
        );
        return stockTable
    }

    function changeStockSelection(e) {
        const target = e.target.value;
        p.updateWidgetConfig(p.widgetKey, {
            targetSecurity: target,
        })
    }

    function renderStockData() {

        const stockDataRows = Array.isArray(rShowData) ? rShowData.map((el) =>
            <tr key={el + "row"}>
                <td key={el + "symbol"}>{el}</td>
                <td key={el + "name"}>{getStockName(`${p.defaultExchange}-${el}`)}</td>
            </tr>
        ) : []
        const newSymbolList = Object.keys(p.trackedStocks).map((el) => (
            <option key={el + "ddl"} value={el}>
                {dStock(p.trackedStocks[el], p.exchangeList)}
            </option>
        ))
        return <>
            <select className="btn" value={p.config.targetSecurity} onChange={changeStockSelection}>
                {newSymbolList}
            </select>
            <div className='scrollableDiv'>
                <table className='dataTable'>
                    <thead><tr><td>Symbol</td><td>Description</td></tr></thead>
                    <tbody>
                        {stockDataRows}
                    </tbody>
                </table>
            </div>
        </>
    }

    return (
        <div data-testid='peersBody'>
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

export default forwardRef(FundamentalsPeers)

export function peersProps(that, key = "newWidgetNameProps") {
    let propList = {
        apiKey: that.props.apiKey,
        defaultExchange: that.props.defaultExchange,
        exchangeList: that.props.exchangeList,
        filters: that.props.widgetList[key]["filters"],
        targetSecurity: that.props.targetSecurity,
        trackedStocks: that.props.widgetList[key]["trackedStocks"],
        updateWidgetConfig: that.props.updateWidgetConfig,
        updateWidgetStockList: that.props.updateWidgetStockList,
        widgetKey: key,
        finnHubQueue: that.props.finnHubQueue
    };
    return propList;
}


