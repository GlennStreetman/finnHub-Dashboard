import * as React from "react"
import { useState, useMemo, forwardRef, useRef } from "react";

import { useAppDispatch, useAppSelector } from '../../../hooks';
import { convertCamelToProper } from '../../../appFunctions/stringFunctions'

import { useDragCopy } from './../../widgetHooks/useDragCopy'
import { useSearchMongoDb } from './../../widgetHooks/useSearchMongoDB'
import { useBuildVisableData } from './../../widgetHooks/useBuildVisableData'
import { useUpdateFocus } from './../../widgetHooks/useUpdateFocus'

import WidgetFocus from '../../../components/widgetFocus'
import WidgetRemoveSecurityTable from '../../../components/widgetRemoveSecurityTable'
import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";

const useDispatch = useAppDispatch
const useSelector = useAppSelector

function FundamentalsNewsSentiment(p: { [key: string]: any }, ref: any) {
    const isInitialMount = useRef(true); //update to false after first render.

    const startingWidgetCoptyRef = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy !== undefined && p.widgetCopy.widgetID !== null) {
                return p.widgetCopy.widgetID
            } else if (p?.config?.targetSecurity) {
                return (p?.config?.targetSecurity)
            } else {
                return ('')
            }
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

    const focusSecurityList = useMemo(() => { //remove if all securities should stay in focus.
        return [p?.config?.targetSecurity] //Object.keys(p.trackedStocks)
    }, [p?.config?.targetSecurity]) //[p.trackedStocks])

    useDragCopy(ref, {})//useImperativeHandle. Saves state on drag. Dragging widget pops widget out of component array causing re-render as new component.
    useUpdateFocus(p.targetSecurity, p.widgetKey, p.config, p.dashBoardData, p.currentDashBoard, p.enableDrag, dispatch) //sets security focus in config. Used for redux.visable data and widget excel templating.
    useSearchMongoDb(p.currentDashBoard, p.finnHubQueue, p.config.targetSecurity, p.widgetKey, widgetCopy, dispatch, isInitialMount, p.dashboardID) //on change to target security retrieve fresh data from mongoDB
    useBuildVisableData(focusSecurityList, p.widgetKey, widgetCopy, dispatch, isInitialMount) //rebuild visable data on update to target security  

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

    function renderStockData() {

        const dataRows = typeof rShowData === 'object' ? Object.entries(rShowData).map((el) => {
            if (typeof el[1] !== 'object' && el[0] !== 'filters') {
                return (
                    <tr key={`${el[0]}-${el[1]}`}>
                        <td className="rightTE" key={`${el[0]}-${el[1]}2`}    >{convertCamelToProper(el[0])}:&nbsp;&nbsp;   </td>
                        <td className="centerTE" key={`${el[0]}-${el[1]}3`}   >{el[1]}</td>
                    </tr>
                )
            } else { return (<tr key={`${el[0]}-${el[1]}4`}></tr>) }
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
                <br />
                <table className='dataTable'>
                    <thead><tr><td>Metrics</td><td>Value</td></tr></thead>
                    <tbody>{dataRows}</tbody>
                </table>
            </>
        return stockTable
    }

    return (
        <div data-testid='newsSentimentBody'>
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

export default forwardRef(FundamentalsNewsSentiment)

export function newsSentimentsProps(that, key = "newWidgetNameProps") {
    let propList = {
        apiKey: that.props.apiKey,
        exchangeList: that.props.exchangeList,
        filters: that.props.widgetList[key]["filters"],
        trackedStocks: that.props.widgetList[key]["trackedStocks"],
        widgetKey: key,
        targetSecurity: that.props.targetSecurity,
        dashBoardData: that.props.dashBoardData,
        currentDashBoard: that.props.currentDashBoard,
    };
    return propList;
}

