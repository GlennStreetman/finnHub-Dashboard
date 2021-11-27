import * as React from "react"
import { useState, useEffect, forwardRef, useRef, useMemo } from "react";
import { convertCamelToProper } from './../../../appFunctions/stringFunctions'


import { useAppDispatch, useAppSelector } from '../../../hooks';
import { tSearchMongoDB, tSearchMongoDBReq } from '../../../thunks/thunkSearchMongoDB'

import { useDragCopy } from './../../widgetHooks/useDragCopy'
import { useSearchMongoDb } from './../../widgetHooks/useSearchMongoDB'
import { useBuildVisableData } from './../../widgetHooks/useBuildVisableData'
import { useUpdateFocus } from './../../widgetHooks/useUpdateFocus'

import WidgetFocus from '../../../components/widgetFocus'
import WidgetRemoveSecurityTable from '../../../components/widgetRemoveSecurityTable'
import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";
import { UpdateWidgetFilters } from 'src/appFunctions/appImport/widgetLogic'
import { updateWidgetConfig } from 'src/appFunctions/appImport/widgetLogic'

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
    useUpdateFocus(p.targetSecurity, p.widgetKey, p.config, p.dashBoardData, p.currentDashBoard, p.enableDrag, p.updateAppState) //sets security focus in config. Used for redux.visable data and widget excel templating.	
    useSearchMongoDb(p.currentDashBoard, p.finnHubQueue, p.config.targetSecurity, p.widgetKey, widgetCopy, dispatch, isInitialMount, p.dashboardID) //on change to target security retrieve fresh data from mongoDB
    useBuildVisableData(focusSecurityList, p.widgetKey, widgetCopy, dispatch, isInitialMount) //rebuild visable data on update to target security

    useEffect(( //if target security is undefined.
        key: number = p.widgetKey,
        trackedStock = p.trackedStocks,
        keyList: string[] = Object.keys(p.trackedStocks),
    ) => {
        if (!p.config.targetSecurity) {
            const newSource: string = keyList.length > 0 ? trackedStock[keyList[0]].key : ''
            updateWidgetConfig(
                key,
                {
                    targetSecurity: newSource,
                    targetReport: 'bs',
                    pagination: 0,
                    year: rShowData ? rShowData[0]?.year : '',
                    quarter: rShowData ? rShowData[0]?.quarter : ''
                },
                p.dashBoardData,
                p.currentDashBoard,
                p.enableDrag,
                p.updateAppState
            )
        }
    }, [rShowData, p.widgetKey, p.trackedStocks, p.apiKey, p.config.targetSecurity])

    useEffect(( //on change to pagination set config year and quarter.
        key: number = p.widgetKey,

        trackedStock = p.trackedStocks,
        keyList: string[] = Object.keys(p.trackedStocks),
    ) => {
        const newSource: string = keyList.length > 0 ? trackedStock[keyList[0]].key : ''
        if (!p.config.quarter || p.config.year) {
            updateWidgetConfig(
                key, {
                targetSecurity: p.config.targetSecurity ? p.config.targetSecurity : newSource,
                targetReport: p.config.targetReport ? p.config.targetReport : 'bs',
                year: rShowData ? rShowData[p.config.pagination]?.year : '',
                quarter: rShowData ? rShowData[p.config.pagination]?.quarter : '',
                pagination: p.config.pagination ? p.config.pagination : 0
            },
                p.dashBoardData,
                p.currentDashBoard,
                p.enableDrag,
                p.updateAppState
            )
        }
    }, [rShowData, p.widgetKey, p.config.year, p.config.pagination, p.config.targetReport, p.config.targetSecurity, p.trackedStocks, p.config.quarter])

    function renderSearchPane() {

        let stockListTable = (
            <WidgetRemoveSecurityTable
                trackedStocks={p.trackedStocks}
                widgetKey={p.widgetKey}
                exchangeList={p.exchangeList}
                dashBoardData={p.dashBoardData}
                currentDashboard={p.currentDashboard}
                apiKey={p.apiKey}
            />
        );
        return <>{stockListTable}</>;
    }

    function changeReportSelection(e) {
        const target = e.target.value;
        const key = `${p.widgetKey}-${p?.config?.targetSecurity}`

        updateWidgetConfig(
            p.widgetKey, {
            targetSecurity: p.config.targetSecurity,
            targetReport: target,
            year: p.config.year,
            quarter: p.config.quarter,
            pagination: p.config.pagination
        },
            p.dashBoardData,
            p.currentDashBoard,
            p.enableDrag,
            p.updateAppState
        )
        const tSearchMongoDBObj: tSearchMongoDBReq = { searchList: [key], dashboardID: p.dashboardID }
        dispatch(tSearchMongoDB(tSearchMongoDBObj))
    }

    async function changeFrequencySelection(e) {
        const target = e.target.value;
        await UpdateWidgetFilters(p.widgetKey, { frequency: target }, p.dashBoardData, p.currentDashBoard, dispatch, p.apiKey, p.finnHubQueue)
        updateWidgetConfig(
            p.widgetKey,
            {
                targetSecurity: p.config.targetSecurity,
                targetReport: p.config.targetReort,
                year: p.config.year,
                quarter: p.config.quarter,
                pagination: 0,
            },
            p.dashBoardData,
            p.currentDashBoard,
            p.enableDrag,
            p.updateAppState
        )
    }

    function changeIncrememnt(e) {
        const newPagination = p.config.pagination + e;
        if (newPagination > -1 && rShowData && newPagination <= Object.keys(rShowData).length - 1) {
            updateWidgetConfig(
                p.widgetKey,
                {
                    targetSecurity: p.config.targetSecurity,
                    targetReport: p.config.targetReport,
                    pagination: newPagination,
                    year: rShowData[newPagination]['year'],
                    quarter: rShowData[newPagination]['quarter'],
                },
                p.dashBoardData,
                p.currentDashBoard,
                p.enableDrag,
                p.updateAppState
            )
        }
    }

    function renderStockData() {

        const reportSelection =
            <>
                <option key='bs' value='bs'> Balance Sheet</option>
                <option key='ic' value='ic' > Income Statement </option>
                <option key='cf' value='cf' > Cash Flow </option>
            </>

        const frequencySeleciton =
            <>
                <option key='quarterly' value='quarterly'> Quartelry </option>
                <option key='annual' value='annual' > Annual </option>

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
                <WidgetFocus
                    widgetType={p.widgetType}
                    widgetKey={p.widgetKey}
                    trackedStocks={p.trackedStocks}
                    exchangeList={p.exchangeList}
                    config={p.config}
                    dashBoardData={p.dashBoardData}
                    currentDashBoard={p.currentDashBoard}
                    enableDrag={p.enableDrag}
                />
                <select data-testid='frequencySelectionm' className="btn" value={p.filters.frequency} onChange={changeFrequencySelection}>
                    {frequencySeleciton}
                </select>
                <select data-testid='financialsAsReportedSelection' className="btn" value={p.config.targetReport} onChange={changeReportSelection}>
                    {reportSelection}
                </select>
                <button data-testid="pageBackward" onClick={() => changeIncrememnt(-1)}>
                    <i className="fa fa-backward" aria-hidden="true"></i>
                </button>
                <button data-testid="pageForward" onClick={() => changeIncrememnt(1)}>
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
        widgetKey: key,
        widgetHeader: that.props.widgetList[key].widgetHeader,
        dashBoardData: that.props.dashBoardData,
    };
    return propList;
}

export const financialsAsReportedFilters = { //IF widget uses filters remember to define default filters here and add to topNavReg as 5th paramater.
    frequency: 'annual'
}


