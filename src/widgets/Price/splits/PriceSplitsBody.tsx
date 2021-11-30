import * as React from "react"
import { useState, useEffect, forwardRef, useRef, useMemo } from "react";
import { widget } from 'src/App'
import { finnHubQueue } from "src/appFunctions/appImport/throttleQueueAPI";


import { useAppDispatch, useAppSelector } from '../../../hooks';

import { useDragCopy } from './../../widgetHooks/useDragCopy'
import { useSearchMongoDb } from './../../widgetHooks/useSearchMongoDB'
import { useBuildVisableData } from './../../widgetHooks/useBuildVisableData'
import { useStartingFilters } from './../../widgetHooks/useStartingFilters'
import { useUpdateFocus } from './../../widgetHooks/useUpdateFocus'

import WidgetFocus from '../../../components/widgetFocus'
import WidgetRemoveSecurityTable from '../../../components/widgetRemoveSecurityTable'
import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";
import WidgetFilterDates from '../../../components/widgetFilterDates'
import { UpdateWidgetFilters } from 'src/appFunctions/appImport/widgetLogic'


const useDispatch = useAppDispatch
const useSelector = useAppSelector

interface finnHubSplitNode {
    date: number,
    fromFactor: number,
    symbol: number,
    toFactor: number,
}

export interface finnHubSplitArray {
    [index: number]: finnHubSplitNode
}

interface filters {
    description: string,
    endDate: number,
    startDate: number,
}

interface widgetProps {
    config: any,
    enableDrag: boolean,
    filters: any,
    finnHubQueue: finnHubQueue,
    pagination: number,
    showEditPane: number,
    trackedStocks: any,
    widgetCopy: any,
    widgetKey: string | number,
    widgetType: string,
}


function PriceSplits(p: widgetProps, ref: any) {
    const isInitialMount = useRef(true); //update to false after first render.

    const startingWidgetCoptyRef = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy !== undefined && typeof p.widgetCopy.widgetID === 'number') {
                return p.widgetCopy.widgetID
            } else { return 0 }
        } else { return 0 }
    }


    const startingStartDate = () => { //save dates as offsets from now
        const now = Date.now()
        const startUnixOffset = p.filters.startDate !== undefined ? p.filters.startDate : -604800 * 1000 * 52
        const startUnix = now + startUnixOffset
        const startDate = new Date(startUnix).toISOString().slice(0, 10);
        return startDate
    }

    const startingEndDate = () => { //save dates as offsets from now
        const now = Date.now()
        const endUnixOffset = p.filters.startDate !== undefined ? p.filters.endDate : 0
        const endUnix = now + endUnixOffset
        const endDate = new Date(endUnix).toISOString().slice(0, 10);
        return endDate
    }

    const [widgetCopy] = useState(startingWidgetCoptyRef())
    const [start, setStart] = useState(startingStartDate())
    const [end, setEnd] = useState(startingEndDate())
    const dispatch = useDispatch();
    const apiKey = useSelector((state) => { return state.apiKey })
    const currentDashboard = useSelector((state) => { return state.currentDashboard })
    const dashboardData = useSelector((state) => { return state.dashboardData })
    const targetSecurity = useSelector((state) => { return state.targetSecurity })
    const exchangeList = useSelector((state) => { return state.exchangeList.exchangeList })
    const dashboardID = dashboardData?.[currentDashboard]?.['id'] ? dashboardData[currentDashboard]['id'] : -1


    interface rShowDat {
        [key: string]: any
    }

    const rShowData: rShowDat | undefined = useSelector((state) => {
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false' &&
            state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData: object = state?.showData?.dataSet?.[p.widgetKey]?.[p.config.targetSecurity]
            return (showData)
        }
    })

    const updateFilterMemo = useMemo(() => { //used inst useStartingFilters Hook.
        return {
            startDate: start,
            endDate: end,
            Description: 'Date numbers are millisecond offset from now. Used for Unix timestamp calculations.'
        }
    }, [start, end])

    const focusSecurityList = useMemo(() => { //remove if all securities should stay in focus.
        return [p?.config?.targetSecurity]
    }, [p?.config?.targetSecurity])

    useDragCopy(ref, {})//useImperativeHandle. Saves state on drag. Dragging widget pops widget out of component array causing re-render as new component.

    useSearchMongoDb(currentDashboard, p.finnHubQueue, p.config.targetSecurity, p.widgetKey, widgetCopy, dispatch, isInitialMount, dashboardID) //on change to target security retrieve fresh data from mongoDB
    useBuildVisableData(focusSecurityList, p.widgetKey, widgetCopy, dispatch, isInitialMount) //rebuild visable data on update to target security
    useStartingFilters(p.filters['startDate'], updateFilterMemo, p.widgetKey, dashboardData, currentDashboard, dispatch, apiKey, p.finnHubQueue)
    useUpdateFocus(targetSecurity, p.widgetKey, p.config, dashboardData, currentDashboard, p.enableDrag, dispatch) //sets security focus in config. Used for redux.visable data and widget excel templating.	

    useEffect((filters: filters = p.filters, key: string | number = p.widgetKey) => {
        if (filters['startDate'] === undefined) { //if filters not saved to props
            const filterUpdate = {
                startDate: start,
                endDate: end,
                Description: 'Date numbers are millisecond offset from now. Used for Unix timestamp calculations.'
            }
            UpdateWidgetFilters(key, filterUpdate, dashboardData, currentDashboard, dispatch, apiKey, p.finnHubQueue)
        }
    }, [p.filters, p.widgetKey, start, end])



    function renderSearchPane() {

        let searchForm = (
            <>
                <WidgetFilterDates
                    start={start}
                    end={end}
                    setStart={setStart}
                    setEnd={setEnd}
                    widgetKey={p.widgetKey}
                    widgetType={p.widgetType}
                    dashboardData={dashboardData}
                    currentDashboard={currentDashboard}
                    apiKey={apiKey}
                    finnHubQueue={p.finnHubQueue}
                />
                <WidgetRemoveSecurityTable
                    trackedStocks={p.trackedStocks}
                    widgetKey={p.widgetKey}
                    exchangeList={exchangeList}
                    dashBoardData={dashboardData}
                    currentDashboard={currentDashboard}
                    apiKey={apiKey}
                />
            </>
        );
        return searchForm
    }

    function stockTable() {
        if (typeof rShowData === 'object' && Object.keys(rShowData).length) {
            const stockList: finnHubSplitNode[] = Object.values(rShowData)
            let sortedData = stockList.sort((a, b) => (new Date(a.date) > new Date(b.date) ? 1 : -1))
            let tableData = sortedData.map((el) => {

                return <tr key={"row" + el.date}>
                    <td className='centerTE'>{el.date}</td>
                    <td className='centerTE'>{el.fromFactor}</td>
                    <td className='centerTE'>{el.toFactor}</td>
                </tr>

            })
            return tableData
        }
    }

    function renderStockData() {

        if (typeof rShowData === 'object') {
            let symbolSelectorDropDown = (
                <>
                    <div>
                        <WidgetFocus
                            widgetType={p.widgetType}
                            widgetKey={p.widgetKey}
                            trackedStocks={p.trackedStocks}
                            exchangeList={exchangeList}
                            config={p.config}
                            dashBoardData={dashboardData}
                            currentDashboard={currentDashboard}
                            enableDrag={p.enableDrag}
                        />
                        {rShowData?.message ? <>{rShowData.message}</> : <></>}
                    </div>
                    <div className='scrollableDiv'>
                        <table className='dataTable'>
                            <thead>
                                <tr>
                                    <td className='centerTE'>Date</td>
                                    <td className='centerTE'>From</td>
                                    <td className='centerTE'>To</td>
                                </tr>
                            </thead>
                            <tbody>{stockTable()}</tbody>
                        </table>
                    </div>
                </>
            );
            return symbolSelectorDropDown;
        }
    }

    return (
        <div data-testid='splitsBody'>
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

export default forwardRef(PriceSplits)

export function PriceSplitsProps(that, key = "newWidgetNameProps") {
    let propList = {
        // apiKey: that.props.apiKey,
        // trackedStocks: that.props.widgetList[key]["trackedStocks"],
        // filters: that.props.widgetList[key]["filters"],
        // widgetKey: key,
        // exchangeList: that.props.exchangeList,
        // defaultExchange: that.props.defaultExchange,
        // targetSecurity: that.props.targetSecurity,
    };
    return propList;
}

export const priceSplitsFilters: object = {
    startDate: -604800 * 1000 * 52 * 20, //20 years
    endDate: 0,
    "Description": 'Date numbers are millisecond offset from now. Used for Unix timestamp calculations.'
}

