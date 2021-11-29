import produce from "immer"

import { dashBoardData } from './../../App'

export const newGlobalStockList = async function (dashBoardData: dashBoardData, currentDashboard: string) {
    //sets current dashboards widgets security list to match global list. Drops data from mongo.
    const globalStockList = dashBoardData[currentDashboard].globalstocklist
    const newFocus: string = globalStockList && Object.keys(globalStockList)[0] ? Object.keys(globalStockList)[0] : ''
    const updatedWidgetList = await produce(dashBoardData, (draftState: dashBoardData) => {
        const widgetList = draftState[currentDashboard].widgetlist
        for (const w in widgetList) {
            if (widgetList[w].widgetConfig === 'stockWidget') {
                widgetList[w]["trackedStocks"] = { ...globalStockList };
                widgetList[w].config.targetSecurity = newFocus
            }
        }
    })
    return [newFocus, updatedWidgetList]
}