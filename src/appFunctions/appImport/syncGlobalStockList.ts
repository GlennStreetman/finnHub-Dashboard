import produce from "immer"
import { AppState, dashBoardData } from './../../App'

export const syncGlobalStockList = async function () {
    const oldState: AppState = this.state;
    const oldWidgetList = oldState.dashBoardData
    const updatedWidgetList: dashBoardData = produce(oldWidgetList, (draftState: dashBoardData) => {
        const widgetList = oldState[oldState.currentDashBoard]
        for (const w in widgetList) {
            if (widgetList[w].widgetConfig === 'stockWidget') {
                widgetList[w]["trackedStocks"] = this.state.globalStockList;
            }
        }
    })

    this.setState(() => {
        const resObj: Partial<AppState> = { dashBoardData: updatedWidgetList }
        return resObj
    }, async () => {
        this.rebuildVisableDashboard()
        let savedDash: boolean = await this.saveDashboard(this.state.currentDashBoard) //saves dashboard setup to server
        if (savedDash === true) {
            if (Object.keys(this.state.globalStockList)[0] !== undefined) this.setSecurityFocus(Object.keys(this.state.globalStockList)[0])
        }
    });
}