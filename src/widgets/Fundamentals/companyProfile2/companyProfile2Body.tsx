import * as React from "react"
import { useState, forwardRef, useRef, useMemo } from "react";

import { useAppDispatch, useAppSelector } from '../../../hooks';


import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";
import { convertCamelToProper } from '../../../appFunctions/stringFunctions'

import { useDragCopy } from './../../widgetHooks/useDragCopy'
import { useTargetSecurity } from '../../widgetHooks/useTargetSecurity'
import { useSearchMongoDb } from '../../widgetHooks/useSearchMongoDB'
import { useBuildVisableData } from '../../widgetHooks/useBuildVisableData'



const useDispatch = useAppDispatch
const useSelector = useAppSelector

function FundamentalsCompanyProfile2(p: { [key: string]: any }, ref: any) {
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
            const showData: object = state?.showData?.dataSet?.[p.widgetKey]?.[p.config.targetSecurity]
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
        const rows = rShowData ? Object.keys(rShowData).map((key) =>
            <tr key={rShowData?.[key + 'tr'] + key}>
                <td key={rShowData?.[key + 'td']}>{`${convertCamelToProper(key)}: `}</td>
                <td key={rShowData?.[key + 'td2'] + key}>
                    {key === 'logo' ? <img key={rShowData?.[key + 'pic'] + key} width='25%' src={rShowData?.[key]} alt={rShowData?.[key]}></img> : rShowData?.[key]}
                </td>
            </tr>
        ) : <></>
        return rows
    }

    function renderSearchPane() {
        return <>
            {stockListForm()}
        </>
    }

    function changeStockSelection(e) { //DELETE IF no target stock
        const target = e.target.value;
        p.updateWidgetConfig(p.widgetKey, {
            targetSecurity: target,
        })
    }

    function renderStockData() {
        const newSymbolList = Object.keys(p.trackedStocks).map((el) => (
            <option key={el + "ddl"} value={el}>
                {p.trackedStocks[el].dStock(p.exchangeList)}
            </option>
        ))


        const stockTable =
            <>
                <select data-testid='profile2DropDown' className="btn" value={p?.config?.targetSecurity} onChange={changeStockSelection}>
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
        updateGlobalStockList: that.props.updateGlobalStockList,
        updateWidgetConfig: that.props.updateWidgetConfig,
        updateWidgetStockList: that.props.updateWidgetStockList,
        widgetKey: key,
        targetSecurity: that.props.targetSecurity,
    };
    return propList;
}


