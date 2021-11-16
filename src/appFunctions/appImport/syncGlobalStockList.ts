import produce from "immer"

import { AppProps } from './../../App'
import { sliceDashboardData } from "src/slices/sliceDashboardData"

export const syncGlobalStockList = async function () {
    //sets current dashboards widgets security list to match global list. Drops data from mongo.
    const globalStockList = this.props.dashboardData[this.props.currentDashboard].globalstocklist
    const newFocus = globalStockList && Object.keys(globalStockList)[0] ? Object.keys(globalStockList)[0] : ''
    const oldProps: AppProps = this.props;
    const oldWidgetList = oldProps.dashboardData
    const updatedWidgetList: sliceDashboardData = await produce(oldWidgetList, (draftState: sliceDashboardData) => {
        const widgetList = draftState[this.props.currentDashboard].widgetlist
        for (const w in widgetList) {
            if (widgetList[w].widgetConfig === 'stockWidget') {
                widgetList[w]["trackedStocks"] = { ...globalStockList };
                widgetList[w].config.targetSecurity = newFocus
            }
        }
    })
    this.props.rSetTargetSecurity(newFocus)
    this.props.rSetDashboardData(updatedWidgetList)
    console.log('Dashboard setup')
    this.rebuildVisableDashboard()
    this.saveDashboard(this.props.currentDashboard) //saves dashboard setup to server
    return true
}