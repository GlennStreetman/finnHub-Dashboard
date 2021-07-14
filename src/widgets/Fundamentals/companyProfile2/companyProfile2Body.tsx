import * as React from "react"
import { useState, forwardRef, useRef, useMemo } from "react";
import { useAppDispatch, useAppSelector } from '../../../hooks';

import WidgetFocus from '../../../components/widgetFocus'
import WidgetRemoveSecurityTable from '../../../components/widgetRemoveSecurityTable'
import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";

import { convertCamelToProper } from '../../../appFunctions/stringFunctions'

import { useDragCopy } from './../../widgetHooks/useDragCopy'
import { useSearchMongoDb } from '../../widgetHooks/useSearchMongoDB'
import { useBuildVisableData } from '../../widgetHooks/useBuildVisableData'
import { useUpdateFocus } from './../../widgetHooks/useUpdateFocus'

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
    useUpdateFocus(p.targetSecurity, p.updateWidgetConfig, p.widgetKey, p.config.targetSecurity) //sets security focus in config. Used for redux.visable data and widget excel templating.	
    useSearchMongoDb(p.currentDashBoard, p.finnHubQueue, p.config.targetSecurity, p.widgetKey, widgetCopy, dispatch, isInitialMount) //on change to target security retrieve fresh data from mongoDB
    useBuildVisableData(focusSecurityList, p.widgetKey, widgetCopy, dispatch, isInitialMount) //rebuild visable data on update to target security


    function stockListForm() {
        let stockListTable = (
            <WidgetRemoveSecurityTable
                trackedStocks={p.trackedStocks}
                widgetKey={p.widgetKey}
                updateWidgetStockList={p.updateWidgetStockList}
                exchangeList={p.exchangeList}
            />
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

    function renderStockData() {

        const stockTable =
            <>
                <WidgetFocus
                    widgetType={p.widgetType} updateWidgetConfig={p.updateWidgetConfig}
                    widgetKey={p.widgetKey}
                    trackedStocks={p.trackedStocks}
                    exchangeList={p.exchangeList}
                    config={p.config}
                />
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
        trackedStocks: that.props.widgetList[key]["trackedStocks"],
        updateWidgetConfig: that.props.updateWidgetConfig,
        updateWidgetStockList: that.props.updateWidgetStockList,
        widgetKey: key,
        targetSecurity: that.props.targetSecurity,
    };
    return propList;
}


