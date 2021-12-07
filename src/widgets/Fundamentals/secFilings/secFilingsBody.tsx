import * as React from "react"
import { useState, forwardRef, useRef, useMemo } from "react";
import { widget } from 'src/App'
import { finnHubQueue } from "src/appFunctions/appImport/throttleQueueAPI";


import { useAppDispatch, useAppSelector } from '../../../hooks';
import { convertCamelToProper } from '../../../appFunctions/stringFunctions'

import { useDragCopy } from './../../widgetHooks/useDragCopy'
import { useSearchMongoDb } from './../../widgetHooks/useSearchMongoDB'
import { useBuildVisableData } from './../../widgetHooks/useBuildVisableData'
import { useUpdateFocus } from './../../widgetHooks/useUpdateFocus'
import { useResetPagination } from './../../widgetHooks/useResetPagination'

import WidgetFocus from '../../../components/widgetFocus'
import WidgetRemoveSecurityTable from '../../../components/widgetRemoveSecurityTable'
import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPane";

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


function FundamentalsSECFilings(p: widgetProps, ref: any) {
    const isInitialMount = useRef(true); //update to false after first render.

    const startingWidgetCoptyRef = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy !== undefined && typeof p.widgetCopy.widgetID === 'number') {
                return p.widgetCopy.widgetID
            } else { return 0 }
        } else { return 0 }
    }


    const startingPagination = () => { //REMOVE IF TARGET STOCK NOT NEEDED.
        if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
            return (p.widgetCopy.pagination)
        } else { return (1) }
    }

    const [widgetCopy] = useState(startingWidgetCoptyRef())
    const [pagination, setPagination] = useState(startingPagination());
    const dispatch = useDispatch(); //allows widget to run redux actions.
    const apiKey = useSelector((state) => { return state.apiKey })
    const currentDashboard = useSelector((state) => { return state.currentDashboard })
    const dashboardData = useSelector((state) => { return state.dashboardData })
    const targetSecurity = useSelector((state) => { return state.targetSecurity })
    const exchangeList = useSelector((state) => { return state.exchangeList.exchangeList })
    const dashboardID = dashboardData?.[currentDashboard]?.['id'] ? dashboardData[currentDashboard]['id'] : -1


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

    useDragCopy(ref, { pagination: pagination, })//useImperativeHandle. Saves state on drag. Dragging widget pops widget out of component array causing re-render as new component.
    useUpdateFocus(targetSecurity, p.widgetKey, p.config, dashboardData, currentDashboard, p.enableDrag, dispatch) //sets security focus in config. Used for redux.visable data and widget excel templating.	
    useSearchMongoDb(currentDashboard, p.finnHubQueue, p.config.targetSecurity, p.widgetKey, widgetCopy, dispatch, isInitialMount, dashboardID) //on change to target security retrieve fresh data from mongoDB
    useBuildVisableData(focusSecurityList, p.widgetKey, widgetCopy, dispatch, isInitialMount) //rebuild visable data on update to target security
    useResetPagination(p.config.targetSecurity, setPagination)

    function changeIncrement(e) {
        const newpagination = pagination + e;
        if (newpagination > 0 && newpagination < 251) setPagination(newpagination);
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

        let stockListTable = (
            <WidgetRemoveSecurityTable
                trackedStocks={p.trackedStocks}
                widgetKey={p.widgetKey}
                exchangeList={exchangeList}
                dashBoardData={dashboardData}
                currentDashboard={currentDashboard}
                apiKey={apiKey}
            />
        );
        return <>{stockListTable}</>;
    }

    function renderStockData() {

        const currentFiling = rShowData ? rShowData?.[pagination] : {}
        const symbolSelectorDropDown = (
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
                    <button data-testid='pageBackward' onClick={() => changeIncrement(-1)}>
                        <i className="fa fa-backward" aria-hidden="true"></i>
                    </button>
                    <button data-testid='pageForward' onClick={() => changeIncrement(1)}>
                        <i className="fa fa-forward" aria-hidden="true"></i>
                    </button>
                </div>
            </>
        )
        const stockDataTable = (
            <>
                {symbolSelectorDropDown}
                <div data-testid='secData' className='scrollableDiv'>
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
        // apiKey: that.props.apiKey,
        // exchangeList: that.props.exchangeList,
        // filters: that.props.widgetList[key]["filters"],
        // trackedStocks: that.props.widgetList[key]["trackedStocks"],
        // widgetKey: key,
        // targetSecurity: that.props.targetSecurity,
        // dashBoardData: that.props.dashBoardData,
        // currentDashBoard: that.props.currentDashBoard,
    };
    return propList;
}
