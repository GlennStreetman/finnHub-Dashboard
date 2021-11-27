import produce from "immer"

import { AppState, dashBoardData } from './../../App'

export const syncGlobalStockList = async function (dashBoardData: dashBoardData, currentDashBoard: string, updateAppState: Function) {
    //sets current dashboards widgets security list to match global list. Drops data from mongo.
    const globalStockList = dashBoardData[currentDashBoard].globalstocklist
    const newFocus = globalStockList && Object.keys(globalStockList)[0] ? Object.keys(globalStockList)[0] : ''

    const updatedWidgetList: dashBoardData = await produce(dashBoardData, (draftState: dashBoardData) => {
        const widgetList = draftState[currentDashBoard].widgetlist
        for (const w in widgetList) {
            if (widgetList[w].widgetConfig === 'stockWidget') {
                widgetList[w]["trackedStocks"] = { ...globalStockList };
                widgetList[w].config.targetSecurity = newFocus
            }
        }
    })
    await updateAppState({
        dashBoardData: updatedWidgetList,
    })
    console.log('Dashboard setup')
    return newFocus

}