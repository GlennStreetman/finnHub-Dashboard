import * as React from "react"
import { useState, forwardRef, useRef, useMemo } from "react";
import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { convertCamelToProper } from '../../../appFunctions/stringFunctions'

import { useDragCopy } from './../../widgetHooks/useDragCopy'

import { useSearchMongoDb } from './../../widgetHooks/useSearchMongoDB'
import { useBuildVisableData } from './../../widgetHooks/useBuildVisableData'
import { useUpdateFocus } from './../../widgetHooks/useUpdateFocus'

import { dStock } from './../../../appFunctions/formatStockSymbols'

const useDispatch = useAppDispatch
const useSelector = useAppSelector

interface FinnHubAPIData {
    accesNumber: string,
    symbol: string,
    cik: string,
    form: string,
    filedDate: string,
    acceptedDate: string,
    reportUrl: string,
    fileingUrl: string,
}

export interface FinnHubAPIDataArray {
    [index: number]: FinnHubAPIData
}

function FundamentalsSECFilings(p: { [key: string]: any }, ref: any) {
    const isInitialMount = useRef(true); //update to false after first render.

    const startingWidgetCoptyRef = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy !== undefined && p.widgetCopy.widgetID !== null) {
                return p.widgetCopy.widgetID
            } else { return -1 }
        }
    }

    const startingPagination = () => { //REMOVE IF TARGET STOCK NOT NEEDED.
        if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
            return (p.widgetCopy.pageinationInt)
        } else { return (1) }
    }

    const [widgetCopy] = useState(startingWidgetCoptyRef())
    const [pageinationInt, setPageinationInt] = useState(startingPagination());
    const dispatch = useDispatch(); //allows widget to run redux actions.

    const rShowData = useSelector((state) => { //REDUX Data associated with this widget.
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false' &&
            state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData: object = state?.showData?.dataSet?.[p.widgetKey]?.[p.config.targetSecurity]
            return (showData)
        }
    })

    const focusSecurityList = useMemo(() => { //remove if all securities should stay in focus.
        return [p?.config?.targetSecurity]
    }, [p?.config?.targetSecurity])

    useDragCopy(ref, { pageinationInt: pageinationInt, })//useImperativeHandle. Saves state on drag. Dragging widget pops widget out of component array causing re-render as new component.
    useUpdateFocus(p.targetSecurity, p.updateWidgetConfig, p.widgetKey) //sets security focus in config. Used for redux.visable data and widget excel templating.	
    useSearchMongoDb(p.config.targetSecurity, p.widgetKey, widgetCopy, dispatch, isInitialMount) //on change to target security retrieve fresh data from mongoDB
    useBuildVisableData(focusSecurityList, p.widgetKey, widgetCopy, dispatch, isInitialMount) //rebuild visable data on update to target security

    function changeIncrement(e) {
        const newpageinationInt = pageinationInt + e;
        if (newpageinationInt > 0 && newpageinationInt < 251) setPageinationInt(newpageinationInt);
    }

    function changeStockSelection(e) {
        const target = e.target.value;
        p.updateWidgetConfig(p.widgetKey, {
            targetSecurity: target,
        })
        setPageinationInt(pageinationInt);
    }

    function formatURLS(e) {
        if (e.includes("http")) {
            return <a href={e} target="_blank" rel="noopener noreferrer">{e.slice(0, 21) + '...'}</a>
        } else return e
    }

    function stockTable(data) {
        if (data !== undefined) {
            let tableData = Object.keys(data).map((el) =>
                <tr key={"row" + el}>
                    <td key={"heading" + el}>{convertCamelToProper(el)}</td>
                    <td key={"value" + el}>{formatURLS(data[el])}</td>
                </tr>
            )
            return tableData
        } else {
            return <></>
        }
    }

    function renderSearchPane() {
        let stockList = Object.keys(p.trackedStocks);
        let row = stockList.map((el) =>
            p.showEditPane === 1 ? (
                <tr key={el + "container"}>
                    <td key={el + "name"}>{dStock(p.trackedStocks[el], p.exchangeList)}</td>
                    <td key={el + "buttonC"}>
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

    function renderStockData() {
        const newSymbolList = Object.keys(p.trackedStocks).map((el) => (
            <option key={el + "ddl"} value={el}>
                {dStock(p.trackedStocks[el], p.exchangeList)}
            </option>
        ));
        const currentFiling = rShowData ? rShowData?.[pageinationInt] : {}
        const symbolSelectorDropDown = (
            <>
                <div>
                    <select value={p.config.targetSecurity} onChange={changeStockSelection}>
                        {newSymbolList}
                    </select>
                    <button onClick={() => changeIncrement(-1)}>
                        <i className="fa fa-backward" aria-hidden="true"></i>
                    </button>
                    <button onClick={() => changeIncrement(1)}>
                        <i className="fa fa-forward" aria-hidden="true"></i>
                    </button>
                </div>
            </>
        )
        const stockDataTable = (
            <>
                {symbolSelectorDropDown}
                <div className='scrollableDiv'>
                    <table className='dataTable'>
                        <thead>
                            <tr>
                                <td>Heading</td>
                                <td>Value</td>
                            </tr>
                        </thead>
                        <tbody>{stockTable(currentFiling)}</tbody>
                    </table>
                </div></>
        )

        return stockDataTable;
    }

    return (
        <div data-testid='secFilingsBody'>
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

export default forwardRef(FundamentalsSECFilings)

export function secFilingsProps(that, key = "newWidgetNameProps") {
    let propList = {
        apiKey: that.props.apiKey,
        exchangeList: that.props.exchangeList,
        filters: that.props.widgetList[key]["filters"],
        trackedStocks: that.props.widgetList[key]["trackedStocks"],
        updateWidgetConfig: that.props.updateWidgetConfig,
        updateWidgetStockList: that.props.updateWidgetStockList,
        widgetKey: key,
        targetSecurity: that.props.targetSecurity,
    };
    return propList;
}
