import produce from "immer"

import { AppState, dashBoardData } from './../../App'

export const syncGlobalStockList = async function () {
    //sets current dashboards widgets security list to match global list. Drops data from mongo.
    const globalStockList = this.state.dashBoardData[this.props.currentDashboard].globalstocklist
    const newFocus = globalStockList && Object.keys(globalStockList)[0] ? Object.keys(globalStockList)[0] : ''
    const oldState: AppState = this.state;
    const oldWidgetList = oldState.dashBoardData
    const updatedWidgetList: dashBoardData = await produce(oldWidgetList, (draftState: dashBoardData) => {
        const widgetList = draftState[this.props.currentDashboard].widgetlist
        for (const w in widgetList) {
            if (widgetList[w].widgetConfig === 'stockWidget') {
                widgetList[w]["trackedStocks"] = { ...globalStockList };
                widgetList[w].config.targetSecurity = newFocus
            }
        }
    })

    this.setState({
        dashBoardData: updatedWidgetList,
        targetSecurity: newFocus,
    }, async () => {
        console.log('Dashboard setup')
        this.rebuildVisableDashboard()
        this.saveDashboard(this.props.currentDashboard) //saves dashboard setup to server
        return true
    });
}