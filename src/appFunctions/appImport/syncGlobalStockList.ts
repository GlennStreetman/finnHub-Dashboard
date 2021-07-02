import produce from "immer"

import { AppState, dashBoardData } from './../../App'

export const syncGlobalStockList = async function () {
    const oldState: AppState = this.state;
    const oldWidgetList = oldState.dashBoardData
    const updatedWidgetList: dashBoardData = produce(oldWidgetList, (draftState: dashBoardData) => {
        const widgetList = draftState[this.state.currentDashBoard].widgetlist
        for (const w in widgetList) {
            if (widgetList[w].widgetConfig === 'stockWidget') {
                widgetList[w]["trackedStocks"] = this.state.globalStockList;
            }
        }
    })

    this.setState({ dashBoardData: updatedWidgetList }, async () => {
        console.log('Dashboard setup')
        this.rebuildVisableDashboard()
        let savedDash: boolean = await this.saveDashboard(this.state.currentDashBoard) //saves dashboard setup to server
        if (savedDash === true) {
            if (Object.keys(this.state.globalStockList)[0] !== undefined) {
                await this.setSecurityFocus(Object.keys(this.state.globalStockList)[0]) //await set focus
                console.log('security focus set')
                this.refreshFinnhubAPIDataCurrentDashboard()
                return true
            } else {
                return true
            }
        }
    });
}